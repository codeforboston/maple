# Bill PDF Text Extraction

Some Massachusetts Legislature bill records have `content.DocumentText` set to
null in the Document API even though the bill PDF contains embedded text. Maple
now falls back to the official PDF at `/Bills/{court}/{billId}.pdf` when the API
text is missing.

## Extraction Scope

The current extractor handles PDFs with embedded text. It does not perform OCR,
so scanned or image-only PDFs are reported but not repaired.

Known 194th General Court examples:

- `H1`: large embedded-text PDF.
- `H4787`: short embedded-text PDF.
- `H5008`: ballot initiative embedded-text PDF.
- `S2539`: regulatory/report-style embedded-text PDF.
- `H18`: image-only/scanned PDF; no OCR support in this implementation.

## Runtime Scraper Behavior

The bill scraper first calls the MA Legislature Document API. If
`DocumentText` is present, it stores the API response as before. If
`DocumentText` is null or absent, the scraper downloads the PDF and tries to
extract text with `pdf-parse`.

Successful PDF extraction stores the result in the existing
`content.DocumentText` field. Failed extraction leaves `DocumentText` absent and
logs the extraction status.

## Backfill Existing Bills

Run the PDF text backfill in dry-run mode first:

```sh
yarn firebase-admin run-script backfillBillPdfText --env dev -- --court 194 --bills "H1 H18 H4787 H5008 S2539" --output ./bill-pdf-text-dry-run.csv
```

After reviewing the CSV, commit writes:

```sh
yarn firebase-admin run-script backfillBillPdfText --env dev -- --court 194 --commit true --output ./bill-pdf-text-dev.csv
```

The script only writes `content.DocumentText` and `fetchedAt` for bills that are
missing `content.DocumentText`. Bills that already have text are skipped.

## Summary And Topic Backfill

Updating existing bill documents does not trigger the Python LLM function,
because that function currently runs on document creation only. After committing
PDF text, run the LLM backfill for the repaired bills:

```sh
python llm/backfill_summaries_runner.py --court 194 --bill-ids "H1 H4787 H5008 S2539" --output ./summaries-and-topics.csv
```

Use `--dry-run` to verify which rows would be processed without updating
Firestore.

`backfill_summaries.py` is the legacy immediate-run wrapper.
`backfill_summaries_runner.py` is the import-safe CLI and test target.
