# Vida Coach Backend

This API powers the Vida Coach application. To run the backend locally:

1. Install dependencies using `pip install -r requirements.txt`.
2. Copy `.env` and adjust environment variables as needed.
3. Start the server with `uvicorn main:app`.

The new `Personality` table is created automatically at startup. No Alembic
migrations are required; simply restart the server or run the tests to apply
the schema changes.

Run the test suite with `pytest` to verify functionality, including the new
personality endpoints. Before running tests, install dependencies using
`pip install -r requirements.txt`.

See [docs/model_pricing.md](docs/model_pricing.md) for adjusting model pricing without modifying code.

## Status
* ✅ Phase 7: Admin Tools Complete
* ✅ CLI + Admin UI Feature Toggles
* ✅ Agent Summary Feedback & Replay

## Docs
* [Agent Guide](docs/agent.md)
* [DevOps Feature Toggle](docs/devops_feature_toggle.md)
* [Testing Notes](docs/testing_notes.md)
