from sqlalchemy import create_engine, Column, String, BigInteger, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Create database engine
# For SQLite, we need to set check_same_thread to False
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    email_id = Column(String(30), primary_key=True)
    password = Column(String(15), nullable=False)
    company_name = Column(String(20), nullable=False, unique=True)
    phone_number = Column(BigInteger, nullable=False, unique=True)
    username = Column(String(30), unique=True)
    invoice_upload = Column(LargeBinary, nullable=True)
    reports = Column(LargeBinary, nullable=True)
