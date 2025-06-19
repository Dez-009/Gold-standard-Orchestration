# Notes: Import scheduler class from APScheduler's background scheduler
from apscheduler.schedulers.background import BackgroundScheduler

# Notes: Import datetime for potential time calculations
import datetime


# Notes: Provide a simple wrapper around BackgroundScheduler for the app
class VidaScheduler:
    """Manage scheduled background jobs for the Vida Coach app."""

    def __init__(self) -> None:
        """Initialize the scheduler and start it immediately."""
        # Notes: Create the background scheduler instance
        self.scheduler = BackgroundScheduler()
        # Notes: Start the scheduler so jobs begin running
        self.scheduler.start()

    def add_daily_job(self, job_func, hour: int, minute: int) -> None:
        """Schedule a job to run every day at a specific time."""
        # Notes: Configure a cron job that triggers daily
        self.scheduler.add_job(
            job_func,
            "cron",
            hour=hour,
            minute=minute,
        )

    def add_weekly_job(
        self, job_func, day_of_week: int | str, hour: int, minute: int
    ) -> None:
        """Schedule a job to run weekly on a specific day and time."""
        # Notes: Configure a cron job that triggers on the chosen weekday
        self.scheduler.add_job(
            job_func,
            "cron",
            day_of_week=day_of_week,
            hour=hour,
            minute=minute,
        )

    def shutdown(self) -> None:
        """Stop the scheduler and clean up resources."""
        # Notes: Shut down the background scheduler
        self.scheduler.shutdown()
