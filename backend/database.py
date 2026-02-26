from sqlalchemy import create_engine, Column, String, Float, Text, DateTime, CheckConstraint, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import UUID
import uuid
import datetime

SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres_pass_2026@localhost:5432/s2p"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    address = Column(Text)
    phone = Column(String(50))
    website_url = Column(String(255))
    google_place_id = Column(String(255), unique=True)
    latitude = Column(Float)
    longitude = Column(Float)
    maps_rating = Column(Float)
    maps_review_count = Column(Float)
    city = Column(String(100))
    country = Column(String(100))
    ai_score = Column(Float)
    ai_analysis = Column(JSON)
    status = Column(String(20), default="discovered")
    source = Column(String(50), default="google_maps")
    sector = Column(String(100))
    
    # State tracking for S2P Journey
    current_phase = Column(Float, default=1)
    rfi = Column(JSON, default=None) # {active: bool, docs: []}
    rfq = Column(JSON, default=None)
    rfp = Column(JSON, default=None)
    qualified = Column(JSON, default=None)
    po_intent = Column(JSON, default=None)
    ap_status = Column(JSON, default=None)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
