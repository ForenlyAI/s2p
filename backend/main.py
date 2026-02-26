from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, Supplier, get_db
from services.google_maps import search_suppliers
from services.ai_scoring import score_suppliers_batch
import uvicorn
import sys

app = FastAPI(title="S2P Agent Backend")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/suppliers")
def list_suppliers(db: Session = Depends(get_db)):
    return db.query(Supplier).order_by(Supplier.ai_score.desc()).all()

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    total = db.query(Supplier).count()
    by_city = db.query(Supplier.city, func.count(Supplier.id)).group_by(Supplier.city).all()
    by_source = db.query(Supplier.source, func.count(Supplier.id)).group_by(Supplier.source).all()
    return {
        "total": total,
        "cities": dict(by_city),
        "sources": dict(by_source)
    }

@app.get("/sectors")
def list_sectors(db: Session = Depends(get_db)):
    sectors = db.query(Supplier.sector).distinct().filter(Supplier.sector != None).all()
    return [s[0] for s in sectors]

@app.post("/suppliers/{supplier_id}/state")
def update_supplier_state(supplier_id: str, state: dict, db: Session = Depends(get_db)):
    print(f"Updating state for {supplier_id}: {state}")
    try:
        from uuid import UUID
        supplier = db.query(Supplier).filter(Supplier.id == UUID(supplier_id)).first()
    except Exception as e:
        print(f"ID conversion error: {e}")
        return {"error": "Invalid ID format"}
        
    if not supplier:
        print(f"Supplier {supplier_id} not found in DB")
        return {"error": "Supplier not found"}
    
    if "current_phase" in state:
        supplier.current_phase = state["current_phase"]
    if "rfi" in state:
        supplier.rfi = state["rfi"]
    if "rfq" in state:
        supplier.rfq = state["rfq"]
    if "rfp" in state:
        supplier.rfp = state["rfp"]
    if "qualified" in state:
        supplier.qualified = state["qualified"]
    if "po_intent" in state:
        supplier.po_intent = state["po_intent"]
    if "ap_status" in state:
        supplier.ap_status = state["ap_status"]
        
    db.commit()
    return {"status": "updated", "id": supplier_id}

@app.post("/discovery")
async def trigger_discovery(query: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(run_discovery, query)
    return {"message": "Discovery started in background", "query": query}

def run_discovery(query: str):
    db = SessionLocal()
    try:
        print(f"Starting discovery for: {query}")
        sys.stdout.flush()
        # 1. Search Google Maps
        places = search_suppliers(query)
        print(f"Found {len(places)} places from Maps")
        if not places:
            return

        # 2. Batch AI Scoring
        ai_scores = score_suppliers_batch(places)
        print(f"Received AI scores for {len(ai_scores)} items")
        score_map = {item['id']: item for item in ai_scores}

        # 3. Upsert to DB
        for place in places:
            p_id = place.get('id')
            res = score_map.get(p_id, {"score": 50, "analysis": "Analysis pending"})
            
            # Using SQLAlchemy for cleaner upsert
            existing = db.query(Supplier).filter(Supplier.google_place_id == p_id).first()
            
            supplier_data = {
                "name": place['displayName']['text'],
                "address": place.get('formattedAddress'),
                "phone": place.get('nationalPhoneNumber'),
                "website_url": place.get('websiteUri'),
                "google_place_id": p_id,
                "latitude": place['location']['latitude'],
                "longitude": place['location']['longitude'],
                "maps_rating": place.get('rating', 0),
                "maps_review_count": place.get('userRatingCount', 0),
                "city": "Unknown",
                "country": "Global",
                "ai_score": res['score'],
                "ai_analysis": res['analysis'],
                "status": "discovered"
            }

            if existing:
                for key, value in supplier_data.items():
                    setattr(existing, key, value)
            else:
                new_supplier = Supplier(**supplier_data)
                db.add(new_supplier)
        
        db.commit()
        print(f"Processed {len(places)} suppliers for query: {query}")
        
    except Exception as e:
        db.rollback()
        print(f"Discovery error: {e}")
        sys.stdout.flush()
    finally:
        db.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
