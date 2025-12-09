"""
Script to initialize the SQLite database with tables and optional default data.
"""
import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.sqlite_db import init_db, SessionLocal
from app.models.auth_models import User
from app.core.security import get_password_hash


def create_default_admin():
    """Create a default admin user if no users exist."""
    db = SessionLocal()
    try:
        # Check if any users exist
        user_count = db.query(User).count()
        if user_count == 0:
            # Create default admin user
            admin_user = User(
                username="admin",
                email="admin@onezippy.ai",
                hashed_password=get_password_hash("admin123"),
                is_active=True,
                is_superuser=True
            )
            db.add(admin_user)
            db.commit()
            print("✓ Default admin user created (username: admin, password: admin123)")
        else:
            print(f"✓ Database already has {user_count} user(s)")
    except Exception as e:
        print(f"Error creating default admin: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    """Main function to initialize database."""
    print("Initializing SQLite database...")

    # Create tables
    init_db()
    print("✓ Database tables created")

    # Create default admin user
    create_default_admin()

    print("\nDatabase initialization complete!")
    print("You can now start the FastAPI server with: uvicorn app.main:app --reload")


if __name__ == "__main__":
    main()
