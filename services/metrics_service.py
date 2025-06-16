"""Utility functions returning system metrics for the admin dashboard."""

from typing import Dict

# Notes: This module only returns placeholder values until real metrics
# integration is implemented.


def get_system_metrics() -> Dict[str, float | int]:
    """Return stubbed metrics for display on the admin dashboard."""
    # Notes: These values are static and should be replaced with real logic
    # that queries the database, background worker and monitoring tools.
    return {
        "active_users": 42,
        "total_subscriptions": 17,
        "load_average": 0.5,
        "job_queue_depth": 3,
        "api_request_count": 256,
    }

