import pytest
from main import app


@pytest.fixture
def client():
    return app.test_client()


def test_summary_returns_404_with_empty_body(client):
    response = client.post("/summary", json={})
    assert response.status_code == 404


def test_summary_returns_404_with_partial_body(client):
    response = client.post("/summary", json={"bill_id": "bill"})
    assert response.status_code == 404


def test_tags_returns_404_with_empty_body(client):
    response = client.post("/tags", json={})
    assert response.status_code == 404


def test_tags_returns_404_with_partial_body(client):
    response = client.post("/tags", json={"bill_id": "bill"})
    assert response.status_code == 404
