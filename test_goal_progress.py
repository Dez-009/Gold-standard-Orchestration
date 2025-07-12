#!/usr/bin/env python3
"""Test script for goal progress functionality."""

import requests
import json
import uuid

BASE_URL = "http://localhost:8000"

def test_goal_progress():
    """Test the goal progress endpoints."""
    
    # Generate unique test data
    unique_id = str(uuid.uuid4())[:8]
    test_user = {
        "email": f"test_{unique_id}@example.com",
        "password": "testpassword123",
        "full_name": "Test User"
    }
    
    # 1. Register a test user
    print("1. Registering test user...")
    register_response = requests.post(f"{BASE_URL}/auth/register", json=test_user)
    if register_response.status_code != 201:
        print(f"Failed to register user: {register_response.status_code}")
        print(f"Response: {register_response.text}")
        return
    
    # 2. Login to get token
    print("2. Logging in...")
    login_response = requests.post(f"{BASE_URL}/auth/login", json={
        "username": test_user["email"],
        "password": test_user["password"]
    })
    if login_response.status_code != 200:
        print(f"Failed to login: {login_response.status_code}")
        print(f"Response: {login_response.text}")
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Create a test goal
    print("3. Creating test goal...")
    goal_data = {
        "user_id": 1,  # Assuming this is the first user
        "title": "Test Goal with Progress",
        "description": "A test goal to verify progress tracking",
        "target": 100
    }
    goal_response = requests.post(f"{BASE_URL}/goals", json=goal_data, headers=headers)
    if goal_response.status_code != 201:
        print(f"Failed to create goal: {goal_response.status_code}")
        print(f"Response: {goal_response.text}")
        return
    
    goal_id = goal_response.json()["id"]
    print(f"Created goal with ID: {goal_id}")
    
    # 4. Get goal progress
    print("4. Getting goal progress...")
    progress_response = requests.get(f"{BASE_URL}/goals/progress", headers=headers)
    if progress_response.status_code != 200:
        print(f"Failed to get progress: {progress_response.status_code}")
        print(f"Response: {progress_response.text}")
        return
    
    goals = progress_response.json()
    print(f"Found {len(goals)} goals with progress")
    for goal in goals:
        print(f"  - {goal['title']}: {goal['progress']}/{goal['target']} ({goal['progress']/goal['target']*100:.1f}%)")
    
    # 5. Update goal progress
    print("5. Updating goal progress...")
    update_data = {"progress": 50}
    update_response = requests.patch(f"{BASE_URL}/goals/{goal_id}/progress", json=update_data, headers=headers)
    if update_response.status_code != 200:
        print(f"Failed to update progress: {update_response.status_code}")
        print(f"Response: {update_response.text}")
        return
    
    updated_goal = update_response.json()
    print(f"Updated goal progress: {updated_goal['progress']}/{updated_goal['target']}")
    
    # 6. Complete the goal
    print("6. Completing the goal...")
    complete_data = {"progress": 100}
    complete_response = requests.patch(f"{BASE_URL}/goals/{goal_id}/progress", json=complete_data, headers=headers)
    if complete_response.status_code != 200:
        print(f"Failed to complete goal: {complete_response.status_code}")
        print(f"Response: {complete_response.text}")
        return
    
    completed_goal = complete_response.json()
    print(f"Goal completed: {completed_goal['is_completed']}")
    
    print("\n✅ All tests passed! Goal progress functionality is working correctly.")

if __name__ == "__main__":
    test_goal_progress() 