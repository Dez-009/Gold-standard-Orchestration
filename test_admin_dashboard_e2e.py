#!/usr/bin/env python3
"""
End-to-end test for admin dashboard user role management.
Tests the complete flow from frontend to backend.
"""

import requests
import json
import uuid
import time

BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3001"

def test_admin_dashboard_e2e():
    """Test the complete admin dashboard user role management flow."""
    
    print("🧪 Testing Admin Dashboard User Role Management E2E")
    print("=" * 60)
    
    # Step 1: Create test users
    print("\n1️⃣ Creating test users...")
    
    # Create a regular user
    regular_user = {
        "email": f"test_user_{uuid.uuid4().hex[:8]}@example.com",
        "hashed_password": "testpassword123",
        "full_name": "Test User",
        "role": "user"
    }
    
    # Create an admin user
    admin_user = {
        "email": f"test_admin_{uuid.uuid4().hex[:8]}@example.com",
        "hashed_password": "testpassword123",
        "full_name": "Test Admin",
        "role": "admin",
        "access_code": "VIDA_ADMIN_2025"
    }
    
    # Register the regular user
    resp = requests.post(f"{BASE_URL}/auth/register", json=regular_user)
    if resp.status_code != 201:
        print(f"❌ Failed to register regular user: {resp.status_code}")
        print(f"Response: {resp.text}")
        return False
    regular_user_id = resp.json()["id"]
    print(f"✅ Regular user created: {regular_user['email']} (ID: {regular_user_id})")
    
    # Register the admin user
    resp = requests.post(f"{BASE_URL}/auth/register", json=admin_user)
    if resp.status_code != 201:
        print(f"❌ Failed to register admin user: {resp.status_code}")
        print(f"Response: {resp.text}")
        return False
    admin_user_id = resp.json()["id"]
    print(f"✅ Admin user created: {admin_user['email']} (ID: {admin_user_id})")
    
    # Step 2: Login as admin
    print("\n2️⃣ Logging in as admin...")
    login_data = {
        "username": admin_user["email"],
        "password": admin_user["hashed_password"]
    }
    resp = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if resp.status_code != 200:
        print(f"❌ Failed to login as admin: {resp.status_code}")
        print(f"Response: {resp.text}")
        return False
    
    admin_token = resp.json()["access_token"]
    print(f"✅ Admin logged in successfully")
    
    # Step 3: Test admin user listing
    print("\n3️⃣ Testing admin user listing...")
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = requests.get(f"{BASE_URL}/admin/users", headers=headers)
    if resp.status_code != 200:
        print(f"❌ Failed to list users: {resp.status_code}")
        print(f"Response: {resp.text}")
        return False
    
    users = resp.json()
    print(f"✅ Found {len(users)} users")
    
    # Verify our test users are in the list
    user_emails = [u["email"] for u in users]
    if regular_user["email"] not in user_emails:
        print(f"❌ Regular user not found in user list")
        return False
    if admin_user["email"] not in user_emails:
        print(f"❌ Admin user not found in user list")
        return False
    print(f"✅ Both test users found in user list")
    
    # Step 4: Test role update
    print("\n4️⃣ Testing role update...")
    
    # Update regular user to pro_user role
    resp = requests.patch(
        f"{BASE_URL}/admin/users/{regular_user_id}",
        params={"role": "pro_user"},
        headers=headers
    )
    if resp.status_code != 200:
        print(f"❌ Failed to update user role: {resp.status_code}")
        print(f"Response: {resp.text}")
        return False
    
    updated_user = resp.json()
    if updated_user["role"] != "pro_user":
        print(f"❌ Role update failed. Expected 'pro_user', got '{updated_user['role']}'")
        return False
    print(f"✅ User role updated to 'pro_user'")
    
    # Step 5: Test invalid role update
    print("\n5️⃣ Testing invalid role update...")
    resp = requests.patch(
        f"{BASE_URL}/admin/users/{regular_user_id}",
        params={"role": "invalid_role"},
        headers=headers
    )
    if resp.status_code != 400:
        print(f"❌ Expected 400 for invalid role, got {resp.status_code}")
        print(f"Response: {resp.text}")
        return False
    print(f"✅ Invalid role correctly rejected")
    
    # Step 6: Test user deactivation
    print("\n6️⃣ Testing user deactivation...")
    resp = requests.delete(
        f"{BASE_URL}/admin/users/{regular_user_id}",
        headers=headers
    )
    if resp.status_code != 200:
        print(f"❌ Failed to deactivate user: {resp.status_code}")
        print(f"Response: {resp.text}")
        return False
    
    deactivation_result = resp.json()
    if deactivation_result.get("status") != "deactivated":
        print(f"❌ Deactivation failed. Expected 'deactivated', got '{deactivation_result}'")
        return False
    print(f"✅ User deactivated successfully")
    
    # Step 7: Verify user list reflects changes
    print("\n7️⃣ Verifying user list reflects changes...")
    resp = requests.get(f"{BASE_URL}/admin/users", headers=headers)
    if resp.status_code != 200:
        print(f"❌ Failed to get updated user list: {resp.status_code}")
        return False
    
    updated_users = resp.json()
    regular_user_updated = next((u for u in updated_users if u["id"] == regular_user_id), None)
    if not regular_user_updated:
        print(f"❌ Regular user not found in updated list")
        return False
    
    if regular_user_updated["role"] != "pro_user":
        print(f"❌ Role not updated in list. Expected 'pro_user', got '{regular_user_updated['role']}'")
        return False
    
    if regular_user_updated.get("is_active", True):  # Default to True if field doesn't exist
        print(f"❌ User should be deactivated but is_active is {regular_user_updated.get('is_active')}")
        return False
    
    print(f"✅ User list correctly reflects role update and deactivation")
    
    # Step 8: Test non-admin access (should be denied)
    print("\n8️⃣ Testing non-admin access...")
    
    # Login as regular user
    regular_login_data = {
        "username": regular_user["email"],
        "password": regular_user["hashed_password"]
    }
    resp = requests.post(f"{BASE_URL}/auth/login", json=regular_login_data)
    if resp.status_code != 200:
        print(f"❌ Failed to login as regular user: {resp.status_code}")
        return False
    
    regular_token = resp.json()["access_token"]
    regular_headers = {"Authorization": f"Bearer {regular_token}"}
    
    # Try to access admin endpoint
    resp = requests.get(f"{BASE_URL}/admin/users", headers=regular_headers)
    if resp.status_code != 403:
        print(f"❌ Expected 403 for non-admin access, got {resp.status_code}")
        print(f"Response: {resp.text}")
        return False
    print(f"✅ Non-admin access correctly denied")
    
    print("\n🎉 All tests passed! Admin dashboard user role management is working correctly.")
    return True

if __name__ == "__main__":
    try:
        success = test_admin_dashboard_e2e()
        if success:
            print("\n✅ E2E Test Summary: Admin user role management is fully functional!")
        else:
            print("\n❌ E2E Test Summary: Some tests failed. Check the output above.")
            exit(1)
    except Exception as e:
        print(f"\n💥 Test failed with exception: {e}")
        exit(1) 