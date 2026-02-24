from sqlalchemy.orm import Session
from sqlalchemy import text
from .models import User, SessionLocal, Base, engine
import traceback
import hashlib
import json
import uuid
from datetime import datetime


# ----------------- DATABASE SESSION HANDLER -----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----------------- USER AUTHENTICATION -----------------
def verify_user(email: str, password: str):
    """Verify user credentials"""
    # Use plain text password comparison since that's how they're stored in DB
    with SessionLocal() as db:
        try:
            result = db.execute(
                text("""
                     SELECT email_id, username, company_name, phone_number
                     FROM users
                     WHERE email_id = :email
                       AND password = :password
                     """),
                {"email": email, "password": password}
            ).fetchone()

            if result:
                return {
                    "email": result[0],
                    "username": result[1],
                    "company_name": result[2],
                    "phone_number": result[3],
                }
            return None
        except Exception as e:
            print(f"Error verifying user: {e}")
            traceback.print_exc()
            return None


# ----------------- INITIALIZATION -----------------
def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")


# ----------------- USER HELPERS -----------------
def check_user_exists(db: Session, email: str) -> bool:
    """Check if a user already exists"""
    try:
        result = db.execute(
            text("SELECT 1 FROM users WHERE email_id = :email"),
            {"email": email}
        )
        return result.fetchone() is not None
    except Exception as e:
        print(f"Database error during user existence check: {e}")
        return False


def create_user(email: str, password: str, username: str, company_name=None, phone_number=None) -> bool:
    """Allow registration only if user already exists in system"""
    with SessionLocal() as db:
        try:
            if not check_user_exists(db, email):
                print(f"User {email} does not exist in the database.")
                return False
            print(f"User {email} exists — registration allowed.")
            return True
        except Exception as e:
            print(f"Error during user creation: {str(e)}")
            traceback.print_exc()
            return False


# ----------------- REPORTS MANAGEMENT -----------------
def get_reports(email: str) -> list:
    """Fetch reports for a user (handles both plain JSON and hex-encoded storage)"""
    print(f"Attempting to fetch reports for user: {email}")
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text("SELECT reports FROM users WHERE email_id = :email"),
                {"email": email}
            ).fetchone()

            print(f"Database query result: {result}")

            if not result or not result[0]:
                print(f"No reports found for user: {email}")
                return []

            data = result[0]
            print(f"Raw data type: {type(data)}")

            # Decode bytes if necessary
            if isinstance(data, bytes):
                data = data.decode('utf-8', errors='ignore')

            # If data starts with \x, decode from hex to UTF-8 string
            if isinstance(data, str) and data.startswith("\\x"):
                try:
                    import codecs
                    print("🔍 Detected hex-encoded JSON, decoding...")
                    data = codecs.decode(data[2:], "hex").decode("utf-8")
                except Exception as decode_err:
                    print(f"⚠️ Failed to decode hex data: {decode_err}")
                    return []

            # Try parsing JSON
            try:
                reports = json.loads(data)
                print(f"✅ Successfully parsed {len(reports)} reports")
                return reports if isinstance(reports, list) else []
            except json.JSONDecodeError as je:
                print(f"⚠️ JSON decode error for {email}: {je}")
                return []

    except Exception as e:
        print(f"Error fetching reports: {e}")
        traceback.print_exc()
        return []


def add_report(email: str, report_info: dict) -> bool:
    """Add a new report record to user"""
    try:
        reports = get_reports(email)
        reports.append(report_info)

        with engine.begin() as conn:
            conn.execute(
                text("UPDATE users SET reports = :r WHERE email_id = :e"),
                {"r": json.dumps(reports).encode('utf-8'), "e": email}
            )
        return True
    except Exception as e:
        print(f"Database error during report addition: {e}")
        traceback.print_exc()
        return False


# Added missing function to resolve ImportError
def update_reports(email: str, reports: list) -> bool:
    """Update the entire reports list for a user"""
    try:
        with engine.begin() as conn:
            conn.execute(
                text("UPDATE users SET reports = :r WHERE email_id = :e"),
                {"r": json.dumps(reports).encode('utf-8'), "e": email}
            )
        return True
    except Exception as e:
        print(f"Database error during reports update: {e}")
        traceback.print_exc()
        return False


# ----------------- DOWNLOAD HISTORY MANAGEMENT -----------------
def insert_excel_report(*, user_id: str, filename: str, invoices_count: int, file_size: str, excel_bytes: bytes) -> str:
    """Insert Excel file record into download_history"""
    with SessionLocal() as db:
        try:
            new_id = str(uuid.uuid4())
            db.execute(
                text("""
                     INSERT INTO download_history
                     (id, user_id, filename, file_type, invoices_count, downloaded_at, file_size, file_data)
                     VALUES (:id, :uid, :fn, 'excel', :cnt, :at, :size, :data)
                     """),
                {
                    "id": new_id,
                    "uid": user_id,
                    "fn": filename,
                    "cnt": str(invoices_count),  # Convert to string to match table definition
                    "at": datetime.now(),  # Use datetime.now() instead of utcnow
                    "size": file_size,
                    "data": excel_bytes  # Store the bytes in file_data column
                }
            )
            db.commit()
            return new_id
        except Exception as e:
            db.rollback()
            print(f"❌ insert_excel_report failed: {e}")
            traceback.print_exc()
            raise e


def get_excel_report(db, user_email, report_id):
    """Fetch Excel file bytes from DB using user email"""
    try:
        # First, get user_id from email
        user_id_row = db.execute(
            text("SELECT id FROM users WHERE email_id = :email"),
            {"email": user_email}
        ).first()
        if not user_id_row:
            print(f"[ERROR] No user found with email={user_email}")
            return None
        user_id = user_id_row[0]

        row = db.execute(
            text("""
                SELECT filename, file_data
                FROM download_history
                WHERE user_id = :uid AND id = :rid
            """),
            {"uid": user_id, "rid": report_id}
        ).first()

        if not row:
            print(f"[DEBUG] No report found for id={report_id}, user={user_email}")
            return None
        print(f"[DEBUG] Found report: filename={row[0]}, bytes_length={len(row[1]) if row[1] else 0}")
        return (row[0], row[1])

    except Exception as e:
        print(f"[ERROR] get_excel_report failed: {e}")
        traceback.print_exc()
        return None
