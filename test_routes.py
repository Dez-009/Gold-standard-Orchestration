#!/usr/bin/env python3
"""Test script to check route registration."""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_routes():
    """Test the route registration."""
    
    # Get the OpenAPI spec
    print("Getting OpenAPI spec...")
    response = requests.get(f"{BASE_URL}/openapi.json")
    if response.status_code != 200:
        print(f"Failed to get OpenAPI spec: {response.status_code}")
        return
    
    spec = response.json()
    
    # Look for goal-related routes
    print("\nGoal-related routes:")
    for path, methods in spec.get("paths", {}).items():
        if "goal" in path.lower():
            print(f"  {path}: {list(methods.keys())}")
    
    # Look specifically for progress routes
    print("\nProgress-related routes:")
    for path, methods in spec.get("paths", {}).items():
        if "progress" in path.lower():
            print(f"  {path}: {list(methods.keys())}")

if __name__ == "__main__":
    test_routes() 