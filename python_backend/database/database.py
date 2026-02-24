import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import hashlib
import json
from .models import Base

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Create database engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """
    Initialize the database tables
    """
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def hash_password(password: str) -> str:
    """Hash a password for storing"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_user(email: str, password: str) -> dict:
    """
    Verify user credentials against the database
    Returns user data if valid, None otherwise
    """
    try:
        # Based on the project setup, passwords are stored in plain text
        # So we don't hash the password for comparison
        plain_password = password

        with engine.connect() as connection:
            # Query to check if user exists with the given email and password
            result = connection.execute(
                text("SELECT email_id, username, company_name, phone_number FROM users WHERE email_id = :email AND password = :password"),
                {"email": email, "password": plain_password}
            )
            user = result.fetchone()

            if user:
                return {
                    "email": user[0],
                    "username": user[1],
                    "company_name": user[2],
                    "phone_number": user[3]
                }
            return None
    except Exception as e:
        print(f"Database error during user verification: {e}")
        return None

def check_user_exists(email: str) -> bool:
    """
    Check if a user already exists in the database
    """
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text("SELECT 1 FROM users WHERE email_id = :email"),
                {"email": email}
            )
            return result.fetchone() is not None
    except Exception as e:
        print(f"Database error during user existence check: {e}")
        return False

def create_user(email: str, password: str, username: str, company_name: str = None, phone_number: str = None) -> bool:
    """
    Check if user can be registered - only allows if user already exists in database
    """
    # Check if user exists in the database
    if not check_user_exists(email):
        print(f"User {email} does not exist in the database and cannot be registered")
        return False

    print(f"User {email} exists in the database and can be registered")
    return True

def get_reports(email: str) -> list:
    """
    Get reports for a user from the user's record
    """
    try:
        print(f"DEBUG: Attempting to fetch reports for user: {email}")
        # Use raw SQL to avoid the binary field processing issue
        with engine.connect() as connection:
            result = connection.execute(
                text("SELECT reports FROM users WHERE email_id = :email"),
                {"email": email}
            )
            row = result.fetchone()

            print(f"DEBUG: Raw reports data for {email}: {row}")

            if row and row[0]:
                print(f"DEBUG: Reports field type: {type(row[0])}")
                # Decode the binary data to JSON
                try:
                    if isinstance(row[0], bytes):
                        reports_data = row[0].decode('utf-8')
                        print(f"DEBUG: Decoded reports data from bytes: {reports_data}")
                    else:
                        reports_data = str(row[0])
                        print(f"DEBUG: String reports data: {reports_data}")

                    # Parse the JSON data
                    reports = json.loads(reports_data)
                    print(f"DEBUG: Parsed reports: {reports}")
                    print(f"DEBUG: Parsed reports type: {type(reports)}")
                    return reports if isinstance(reports, list) else []
                except (json.JSONDecodeError, UnicodeDecodeError) as e:
                    print(f"ERROR: Error decoding reports data: {e}")
                    print(f"ERROR: Problematic data: {row[0]}")
                    # Try to fix the data if it's a string that looks like JSON
                    try:
                        # If it's a string that looks like JSON, try to parse it directly
                        if isinstance(row[0], str) and row[0].startswith('[') and row[0].endswith(']'):
                            reports = json.loads(row[0])
                            print(f"DEBUG: Parsed string reports directly: {reports}")
                            return reports if isinstance(reports, list) else []
                    except Exception as inner_e:
                        print(f"ERROR: Failed to parse string reports directly: {inner_e}")
                    return []
            else:
                print(f"DEBUG: No reports data found for user {email} or reports field is empty")
            return []
    except Exception as e:
        print(f"ERROR: Database error during reports fetch: {e}")
        return []
def add_report(email: str, report_info: dict) -> bool:
    """
    Add a report to user's reports in the user's record
    """
    try:
        # First get existing reports
        existing_reports = get_reports(email)

        # Add new report to the list
        existing_reports.append(report_info)

        # Convert to JSON and encode as bytes
        reports_json = json.dumps(existing_reports)
        reports_bytes = reports_json.encode('utf-8')

        # Update the user's record with the new reports data
        with engine.connect() as connection:
            trans = connection.begin()
            try:
                connection.execute(
                    text("UPDATE users SET reports = :reports WHERE email_id = :email"),
                    {"reports": reports_bytes, "email": email}
                )
                trans.commit()
                return True
            except Exception as e:
                trans.rollback()
                raise e
    except Exception as e:
        print(f"Database error during report addition: {e}")
        return False

def update_reports(email: str, reports_list: list) -> bool:
    """
    Update the entire reports list for a user
    """
    try:
        # Convert to JSON and encode as bytes
        reports_json = json.dumps(reports_list)
        reports_bytes = reports_json.encode('utf-8')

        # Update the user's record with the new reports data
        with engine.connect() as connection:
            trans = connection.begin()
            try:
                connection.execute(
                    text("UPDATE users SET reports = :reports WHERE email_id = :email"),
                    {"reports": reports_bytes, "email": email}
                )
                trans.commit()
                return True
            except Exception as e:
                trans.rollback()
                raise e
    except Exception as e:
        print(f"Database error during reports update: {e}")
        return False
