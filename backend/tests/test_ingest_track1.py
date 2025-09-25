from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_ingest_creates_analysis_with_tech_transfer():
    payload = {
        "title": "Adaptive catalyst membranes for electrolysis",
        "abstract": "We present a catalyst membrane design that adjusts porosity under load to reduce degradation.",
    }
    response = client.post("/ingest", json=payload)
    assert response.status_code == 200
    data = response.json()
    analysis_id = data["analysis_id"]
    assert analysis_id

    analysis_response = client.get(f"/analysis/{analysis_id}")
    assert analysis_response.status_code == 200
    analysis_data = analysis_response.json()
    assert analysis_data["novelty_score"] >= 0
    assert analysis_data["related_patents"], "expected fallback patents"
    assert analysis_data["related_publications"], "expected fallback publications"
    stakeholders = analysis_data["stakeholders"]
    assert "inventors" in stakeholders
    assert analysis_data["licensing_opportunities"], "should suggest opportunities"


def test_agent_endpoint_uses_analysis_context():
    payload = {
        "title": "Adaptive catalyst membranes for electrolysis",
        "abstract": "Catalyst membrane design",
    }
    analysis_id = client.post("/ingest", json=payload).json()["analysis_id"]

    agent_response = client.post(
        f"/agent/{analysis_id}",
        json={"message": "Who should we license to?"},
    )
    assert agent_response.status_code == 200
    body = agent_response.json()
    assert "Consider outreach" in body["agent_response"]

