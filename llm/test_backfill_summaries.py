import backfill_summaries_runner


class FakeReference:
    def __init__(self):
        self.updates = []

    def update(self, payload):
        self.updates.append(payload)


class FakeBill:
    def __init__(self, data):
        self._data = data
        self.reference = FakeReference()

    def to_dict(self):
        return self._data


class FakeCollection:
    def __init__(self, bills):
        self._bills = bills

    def get(self):
        return self._bills


class FakeDb:
    def __init__(self, bills):
        self.bills = bills
        self.path = None

    def collection(self, path):
        self.path = path
        return FakeCollection(self.bills)


def test_backfill_summaries_skips_bills_without_text():
    bill = FakeBill({"id": "H18", "content": {"Title": "No text"}})
    rows = backfill_summaries_runner.backfill_summaries(FakeDb([bill]))

    assert rows == [
        ["bill_id", "status", "summary", "topics"],
        ["H18", "skipped", "None", "None"],
    ]
    assert bill.reference.updates == []


def test_backfill_summaries_generates_topics_when_summary_exists(monkeypatch):
    bill = FakeBill(
        {
            "id": "H1",
            "content": {"Title": "Title", "DocumentText": "Text"},
            "summary": "Existing summary",
        }
    )
    monkeypatch.setattr(
        backfill_summaries_runner,
        "get_tags_api_function_v2",
        lambda bill_id, title, summary: {
            "status": 1,
            "tags": ["Consumer protection"],
        },
    )

    rows = backfill_summaries_runner.backfill_summaries(FakeDb([bill]))

    assert rows[1] == ["H1", "previous_summary", "None", "None"]
    assert rows[2][0:3] == [
        "H1",
        "generated_summary_and_topics",
        "Existing summary",
    ]
    assert bill.reference.updates == [
        {"topics": [{"topic": "Consumer protection", "category": "Commerce"}]}
    ]


def test_backfill_summaries_dry_run_avoids_firestore_updates(monkeypatch):
    bill = FakeBill({"id": "H1", "content": {"Title": "Title", "DocumentText": "Text"}})
    monkeypatch.setattr(
        backfill_summaries_runner,
        "get_summary_api_function",
        lambda bill_id, title, text: {"status": 1, "summary": "New summary"},
    )
    monkeypatch.setattr(
        backfill_summaries_runner,
        "get_tags_api_function_v2",
        lambda bill_id, title, summary: {
            "status": 1,
            "tags": ["Consumer protection"],
        },
    )

    rows = backfill_summaries_runner.backfill_summaries(FakeDb([bill]), dry_run=True)

    assert rows[1][0:3] == ["H1", "generated_summary_and_topics", "New summary"]
    assert bill.reference.updates == []


def test_parse_bill_ids_accepts_spaces_and_commas():
    assert backfill_summaries_runner.parse_bill_ids("H1 H18,S2539") == {
        "H1",
        "H18",
        "S2539",
    }
