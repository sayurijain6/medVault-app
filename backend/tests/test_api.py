from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root():
    res = client.get("/")
    assert res.status_code == 200
    assert "status" in res.json()


def test_health():
    for path in ("/health", "/api/health"):
        res = client.get(path)
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"


def test_patient_routes_require_bearer_token():
    res = client.get("/api/patient/my-reports/some-patient")
    assert res.status_code in (401, 403)
