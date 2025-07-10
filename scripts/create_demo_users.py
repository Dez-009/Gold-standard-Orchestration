#!/usr/bin/env python3
"""
Script to create demo users for testing the role-based authentication system.
Creates both a regular user and an admin user for testing purposes.
"""

import sys
import os

# Add the project root to the Python path
sys.path.append('/Users/mac_d/vidaa/vida-coach-backend')

from sqlalchemy.orm import Session
from database.session import SessionLocal
from models.user import User
from utils.password_utils import hash_password


def create_demo_users():
    """Create demo users for testing the authentication system."""
    
    # Create database session
    db: Session = SessionLocal()
    
    try:
        # Check if demo users already exist
        existing_user = db.query(User).filter(User.email == "user@demo.com").first()
        existing_admin = db.query(User).filter(User.email == "admin@demo.com").first()
        
        if existing_user:
            print("Demo user (user@demo.com) already exists!")
        else:
            # Create demo user
            user_password = hash_password("password123")
            demo_user = User(
                email="user@demo.com",
                hashed_password=user_password,
                full_name="Demo User",
                role="user",
                is_active=True
            )
            db.add(demo_user)
            print("Created demo user: user@demo.com (password: password123)")
        
        if existing_admin:
            print("Demo admin (admin@demo.com) already exists!")
        else:
            # Create demo admin
            admin_password = hash_password("admin123")
            demo_admin = User(
                email="admin@demo.com",
                hashed_password=admin_password,
                full_name="Demo Admin",
                role="admin",
                is_active=True
            )
            db.add(demo_admin)
            print("Created demo admin: admin@demo.com (password: admin123)")
        
        # Commit the changes
        db.commit()
        
        # Verify creation
        users = db.query(User).filter(User.email.in_(["user@demo.com", "admin@demo.com"])).all()
        print(f"\nDemo users in database:")
        for user in users:
            print(f"- {user.email} (role: {user.role}, active: {user.is_active})")
        
    except Exception as e:
        print(f"Error creating demo users: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Creating demo users for role-based authentication testing...")
    create_demo_users()
    print("Demo user creation complete!")
