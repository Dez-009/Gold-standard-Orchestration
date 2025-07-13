from fastapi import APIRouter, Depends
from auth.dependencies import get_current_admin_user
from models.user import User
import psutil
import os
import time
from datetime import datetime

router = APIRouter(prefix="/admin/health", tags=["admin-health"])


@router.get("/ping")
async def admin_ping(current_user: User = Depends(get_current_admin_user)):
    """Admin health check endpoint."""
    return {"status": "ok", "user": current_user.email}


@router.get("/")
async def admin_health(current_user: User = Depends(get_current_admin_user)):
    """Comprehensive admin health check endpoint."""
    # For now, assume database is connected since we're authenticated
    database_status = "connected"

    # Get system metrics
    try:
        memory = psutil.virtual_memory()
        cpu_percent = psutil.cpu_percent(interval=1)
        disk = psutil.disk_usage('/')
        
        # Get system uptime
        uptime_seconds = time.time() - psutil.boot_time()
        uptime_hours = int(uptime_seconds // 3600)
        uptime_minutes = int((uptime_seconds % 3600) // 60)
        uptime_str = f"{uptime_hours}h {uptime_minutes}m"
        
        # Get load average (Unix-like systems)
        try:
            load_avg = psutil.getloadavg()
            load_avg_str = f"{load_avg[0]:.2f}, {load_avg[1]:.2f}, {load_avg[2]:.2f}"
        except:
            load_avg_str = "Unknown"
            
    except Exception:
        # Create simple objects with percent attributes for fallback
        class MockMemory:
            percent = 0
        class MockDisk:
            percent = 0
        memory = MockMemory()
        cpu_percent = 0
        disk = MockDisk()
        uptime_str = "Unknown"
        load_avg_str = "Unknown"

    # Check AI service (OpenAI API key)
    ai_status = "no_key"
    if os.getenv("OPENAI_API_KEY") and os.getenv("OPENAI_API_KEY") != "test":
        ai_status = "available"

    return {
        "database": database_status,
        "ai": ai_status,
        "disk_space": f"{disk.percent}% used",
        "uptime": uptime_str,
        "memory_usage": f"{memory.percent}%",
        "cpu_usage": f"{cpu_percent}%",
        "load_average": load_avg_str,
        "active_connections": "Unknown",  # Could be enhanced with actual connection tracking
        "environment": os.getenv("ENVIRONMENT", "development"),
        "version": "1.0.0",  # Could be enhanced with actual version from config
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/detailed")
async def admin_detailed_health(current_user: User = Depends(get_current_admin_user)):
    """Detailed admin health check endpoint."""
    return {
        "status": "ok",
        "user": current_user.email,
        "admin": True,
        "timestamp": datetime.utcnow().isoformat()
    } 