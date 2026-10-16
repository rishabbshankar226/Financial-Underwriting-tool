from api_client import TestClient
from app.main import app


def test_health_endpoint():
    response=TestClient(app).get('/health')
    assert response.status_code==200
    body=response.json()
    assert body == {'status': 'ok'}
