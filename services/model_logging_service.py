"""Service providing access to recent AI model usage logs."""

# Notes: datetime used for generating ISO timestamps
from datetime import datetime, timedelta


# Notes: Static data used until database integration is implemented
_FAKE_LOGS = [
    {
        "timestamp": (datetime.utcnow() - timedelta(minutes=i)).isoformat(),
        "user_id": (i % 5) + 1,
        "provider": "OpenAI" if i % 2 == 0 else "Claude",
        "model_name": "gpt-4o" if i % 2 == 0 else "claude-3",
        "tokens_used": 100 + i,
        "latency_ms": 500 + i * 3,
    }
    for i in range(100)
]


def get_model_logs() -> list[dict]:
    """Return a list of recent model usage log entries."""
    # Notes: In the future this will query a real data store
    return _FAKE_LOGS
