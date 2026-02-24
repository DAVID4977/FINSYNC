from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Response, Query, Header
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import tempfile
from pathlib import Path
from typing import List, Optional
import shutil
from invoice_processor import ExcelAgent, process_invoice_files
import pandas as pd
from datetime import datetime
from database import verify_user, get_db, create_user, get_reports as db_get_reports, add_report, init_db, update_reports
from sqlalchemy import text
import secrets
import json
import time
import uuid
import traceback
from database.crud import insert_excel_report, get_excel_report
from database.models import engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

app = FastAPI()

# ✅ Adjust path based on your structure
OUTPUT_DIR = Path("output")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust for your frontend host if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/get-reports")
async def get_reports():
    if not OUTPUT_DIR.exists():
        return {"files": []}

    excel_files = sorted(
        [f.name for f in OUTPUT_DIR.glob("*.xlsx")],
        reverse=True  # newest first
    )
    return {"files": excel_files}

# ==========================================================
# APP SETUP
# ==========================================================
app = FastAPI(title="FinSync GST Backend", version="1.1.0")

# ---------------- CORS -----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict later for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- folders --------------
os.makedirs("temp_uploads", exist_ok=True)
os.makedirs("output", exist_ok=True)
os.makedirs("sessions", exist_ok=True)

# ---------------- db init --------------
init_db()

# ---------------- session utils -------
SESSION_TIMEOUT = 24 * 60 * 60  # 24 hours


def save_session(session_id: str, user_data: dict):
    session_file = f"sessions/{session_id}.json"
    with open(session_file, "w") as f:
        json.dump({"user": user_data,
                   "created_at": time.time(),
                   "expires_at": time.time() + SESSION_TIMEOUT}, f)


def load_session(session_id: str):
    if not session_id:
        return None
    session_file = f"sessions/{session_id}.json"
    if not os.path.exists(session_file):
        return None
    with open(session_file) as f:
        data = json.load(f)
    if time.time() > data.get("expires_at", 0):
        os.remove(session_file)
        return None
    return data.get("user")


def verify_session(session_id: str = None):
    if not session_id:
        raise HTTPException(status_code=401, detail="Missing session ID")
    user = load_session(session_id)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return user


def verify_bearer_token(authorization: Optional[str] = Header(None)):
    """Verify Bearer token authentication"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    
    try:
        # Extract token from "Bearer <token>"
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        
        # For now, we'll use a simple approach - check if token exists in localStorage
        # In a real app, you'd verify the JWT token here
        # For this demo, we'll assume the token is valid and return a mock user
        return {"email": "vtu25961@veltech.edu.in", "username": "admin"}
        
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")


# ==========================================================
# AUTH ENDPOINTS
# ==========================================================
@app.post("/api/login")
async def login(credentials: dict):
    email = credentials.get("email")
    password = credentials.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    user = verify_user(email, password)
    if user:
        session_id = secrets.token_urlsafe(32)
        save_session(session_id, user)
        return {
            "success": True,
            "message": "Login successful",
            "session_id": session_id,
            "user": user
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")


# ==========================================================
# MAIN FLOW — UPLOAD + EXTRACT
# ==========================================================
@app.post("/api/extract-gst")
async def extract_gst_data(
        files: List[UploadFile] = File(...),
        session_id: str = None
):
    user = verify_session(session_id)
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    temp_files = []
    try:
        for file in files:
            if file.content_type not in ['application/pdf', 'image/png', 'image/jpeg']:
                raise HTTPException(status_code=400, detail=f"Unsupported type: {file.content_type}")
            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix)
            tmp.write(await file.read())
            tmp.close()
            temp_files.append(tmp.name)

        result = process_invoice_files(temp_files)
        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("message", "Processing failed"))

        excel_path = "output/Consolidated_Invoices_Output.xlsx"
        if not os.path.exists(excel_path):
            raise HTTPException(status_code=404, detail="Excel output file not found")

        file_size = f"{os.path.getsize(excel_path) / 1024:.1f} KB"
        with open(excel_path, "rb") as f:
            excel_bytes = f.read()

        db_generator = get_db()
        db = next(db_generator)
        try:
            report_id = insert_excel_report(
                user_id=user["email"],
                filename="GST_Invoices_Extract.xlsx",
                invoices_count=result.get("invoices_count", 0),
                file_size=file_size,
                excel_bytes=excel_bytes
            )

            # Also insert into PostgreSQL download_history table
            with engine.connect() as connection:
                trans = connection.begin()
                try:
                    connection.execute(
                        text("""
                            INSERT INTO download_history 
                            (id, user_id, filename, file_type, invoices_count, file_size, file_data, downloaded_at)
                            VALUES (:id, :user_id, :filename, :file_type, :invoices_count, :file_size, :file_data, :downloaded_at)
                        """),
                        {
                            "id": str(uuid.uuid4()),
                            "user_id": user["email"],
                            "filename": "GST_Invoices_Extract.xlsx",
                            "file_type": "excel",
                            "invoices_count": str(result.get("invoices_count", 0)),
                            "file_size": file_size,
                            "file_data": excel_bytes,
                            "downloaded_at": datetime.now()
                        }
                    )
                    trans.commit()
                    print(f"[DEBUG] Inserted download history record for user: {user['email']}")
                except Exception as e:
                    trans.rollback()
                    print(f"[WARNING] Failed to insert download history: {e}")

            report_info = {
                "id": report_id,
                "filename": "GST_Invoices_Extract.xlsx",
                "file_type": "excel",
                "invoices_count": str(result.get("invoices_count", 0)),
                "downloaded_at": datetime.now().isoformat(),
                "file_size": file_size
            }
            add_report(user.get('email'), report_info)
        finally:
            db.close()
            try:
                next(db_generator)
            except StopIteration:
                pass

        return {
            "success": True,
            "message": result.get("message", "Files processed successfully"),
            "invoices_count": result.get("invoices_count", 0),
            "report_id": report_id
        }

    finally:
        for t in temp_files:
            try:
                os.unlink(t)
            except:
                pass


# ==========================================================
# OUTPUT FOLDER MANAGEMENT ENDPOINTS
# ==========================================================
def format_datetime(timestamp):
    """Format timestamp to ISO string"""
    return datetime.fromtimestamp(timestamp).isoformat()


@app.get("/api/output-files")
async def get_output_files():
    """List Excel files from output folder"""
    try:
        output_folder = "output"
        if not os.path.exists(output_folder):
            return []
        files = []
        for filename in os.listdir(output_folder):
            if filename.endswith(".xlsx"):
                file_path = os.path.join(output_folder, filename)
                stat = os.stat(file_path)
                invoice_count = "0"
                if "_" in filename:
                    try:
                        parts = filename.split("_")
                        if len(parts) > 2:
                            invoice_count = parts[-1].replace(".xlsx", "")
                    except:
                        invoice_count = "0"
                files.append({
                    "id": filename,
                    "filename": filename,
                    "invoicesCount": invoice_count,
                    "fileSize": str(stat.st_size),
                    "createdAt": format_datetime(stat.st_ctime)
                })
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/download-output-file")
async def download_output_file(filename: str):
    """Download a specific Excel file from output folder"""
    try:
        output_folder = "output"
        file_path = os.path.join(output_folder, filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        return FileResponse(
            file_path,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename=filename
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/delete-output-file")
async def delete_output_file(filename: str):
    """Delete a specific Excel file from output folder"""
    try:
        output_folder = "output"
        file_path = os.path.join(output_folder, filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        os.remove(file_path)
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================================
# DOWNLOAD HISTORY FROM POSTGRESQL DATABASE
# ==========================================================
@app.get("/api/download-history")
async def get_download_history(
    session_id: Optional[str] = Query(None, description="Active user session ID"),
    authorization: Optional[str] = Header(None)
        ,):
    print(f"[DEBUG] Incoming session_id: {session_id}, authorization: {authorization}")
    try:
        # 🔐 Authentication
        if authorization:
            user = verify_bearer_token(authorization)
        elif session_id:
            user = verify_session(session_id)
        else:
            raise HTTPException(status_code=401, detail="Missing authentication")

        user_email = user["email"]

        print(f"[DEBUG] Fetching download history for user: {user_email}")

        with engine.connect() as connection:
            query = text("""
                SELECT id, filename, file_type, invoices_count, file_size, downloaded_at
                FROM download_history
                WHERE user_id = :user_id
                ORDER BY downloaded_at DESC
                LIMIT 50
            """)
            result = connection.execute(query, {"user_id": user_email})

            history = [
                {
                    "id": r.id,
                    "filename": r.filename,
                    "fileType": r.file_type or "excel",
                    "downloadType": "gst_extract",
                    "period": None,
                    "invoicesCount": str(r.invoices_count or 0),
                    "fileSize": str(r.file_size or 0),
                    "downloadedAt": r.downloaded_at.isoformat() if r.downloaded_at else None,
                }
                for r in result
            ]

        print(f"[DEBUG] Found {len(history)} download history records")
        return history

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Fetch download history failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================================
# DELETE DOWNLOAD HISTORY ENTRY
# ==========================================================
@app.delete("/api/download-history/{report_id}")
async def delete_download_history(
    report_id: str,
    session_id: Optional[str] = Query(None, description="Active user session ID"),
    authorization: Optional[str] = Header(None)
):
    """Delete a download history entry from PostgreSQL database"""
    try:
        # Try Bearer token authentication first, then session
        if authorization:
            user = verify_bearer_token(authorization)
        elif session_id:
            user = verify_session(session_id)
        else:
            raise HTTPException(status_code=401, detail="Missing authentication")
            
        user_email = user["email"]
        
        print(f"[DEBUG] Deleting download history record {report_id} for user: {user_email}")
        
        # Delete from PostgreSQL download_history table
        with engine.connect() as connection:
            trans = connection.begin()
            try:
                result = connection.execute(
                    text("""
                        DELETE FROM download_history 
                        WHERE id = :report_id AND user_id = :user_id
                    """),
                    {"report_id": report_id, "user_id": user_email}
                )
                
                if result.rowcount == 0:
                    raise HTTPException(status_code=404, detail="Report not found")
                
                trans.commit()
                print(f"[DEBUG] Successfully deleted download history record {report_id}")
                return {"success": True, "message": "Report deleted successfully"}
                
            except HTTPException:
                trans.rollback()
                raise
            except Exception as e:
                trans.rollback()
                raise HTTPException(status_code=500, detail=f"Failed to delete report: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Delete download history failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to delete report: {str(e)}")


# ==========================================================
# DOWNLOAD FILE FROM POSTGRESQL DATABASE
# ==========================================================
@app.get("/api/download-excel")
async def download_excel_from_db(
    report_id: Optional[str] = Query(None, description="Report ID to download"),
    session_id: Optional[str] = Query(None, description="Active user session ID"),
    authorization: Optional[str] = Header(None)
):
    """Download Excel file from PostgreSQL database"""
    try:
        # Try Bearer token authentication first, then session
        if authorization:
            user = verify_bearer_token(authorization)
        elif session_id:
            user = verify_session(session_id)
        else:
            raise HTTPException(status_code=401, detail="Missing authentication")
            
        user_email = user["email"]
        
        print(f"[DEBUG] Download request for user: {user_email}, report_id: {report_id}")
        
        # Query the download_history table from PostgreSQL
        with engine.connect() as connection:
            if report_id:
                # Download specific report by ID
                result = connection.execute(
                    text("""
                        SELECT filename, file_data 
                        FROM download_history 
                        WHERE id = :report_id AND user_id = :user_id
                    """),
                    {"report_id": report_id, "user_id": user_email}
                ).first()
            else:
                # Download latest report
                result = connection.execute(
                    text("""
                        SELECT filename, file_data 
                        FROM download_history 
                        WHERE user_id = :user_id
                        ORDER BY downloaded_at DESC
                        LIMIT 1
                    """),
                    {"user_id": user_email}
                ).first()
            
            if not result:
                raise HTTPException(status_code=404, detail="Report not found")
            
            filename, file_data = result
            if not file_data:
                raise HTTPException(status_code=404, detail="Report file is empty")
            
            # Convert memoryview to bytes if necessary
            if isinstance(file_data, memoryview):
                file_data = bytes(file_data)
            
            return Response(
                content=file_data,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f'attachment; filename="{filename}"'}
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Download failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")


# ==========================================================
# HEALTH CHECK
# ==========================================================
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "FinSync GST Backend"}

@app.post("/api/process-invoices")
async def process_invoices(files: List[UploadFile] = File(...)):
    try:
        output_path = process_invoice_files(files)  # this saves Excel to output/
        return {"success": True, "output_file": output_path.name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# ==========================================================
# ENTRY POINT
# ==========================================================
if __name__ == "__main__":
    print("🚀 Starting FinSync GST Backend")
    print("🌐 Server running on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
