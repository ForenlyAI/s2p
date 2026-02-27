import random
import psycopg2
from uuid import uuid4
import json

# Configuration
DB_URL = "host=localhost dbname=s2p user=postgres password=postgres_pass_2026"

CITIES = [
    "Istanbul", "Bursa", "Kocaeli", "Sakarya", "Tekirdag", 
    "Balikesir", "Canakkale", "Edirne", "Kirklareli", "Yalova", "Bilecik"
]

COMPANY_SUFFIXES = ["Ambalaj A.Ş.", "Kağıt Bardak Ltd.", "Dış Ticaret", "Bardak Fabrikası", "Endüstriyel Mutfak"]
NAME_PREFIXES = ["Alfa", "Beta", "Ege", "Marmara", "Global", "Elite", "Arden", "Vizyon", "Piramit", "Zirve"]

def seed():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    print("🗑️ Cleaning up old Paper Cup mockup data...")
    cur.execute("DELETE FROM suppliers WHERE sector = 'Paper Cup';")
    
    print("🚀 Seeding 110 Paper Cup suppliers for Marmara region...")
    
    for city in CITIES:
        for i in range(1, 11):
            name = f"{random.choice(NAME_PREFIXES)} {random.choice(COMPANY_SUFFIXES)} - {city} Unit {i}"
            score = 75 + random.random() * 20
            
            # Pre-filled state
            rfi = json.dumps({"active": True, "docs": [f"{name.replace(' ', '_')}_RFI_v1.pdf"]})
            rfq = json.dumps({"active": True, "docs": [f"{name.replace(' ', '_')}_RFQ_v1.pdf"]})
            # 50% have RFP
            has_rfp = i % 2 == 0
            rfp = json.dumps({"active": True, "docs": [f"{name.replace(' ', '_')}_RFP_v1.pdf"]}) if has_rfp else None
            
            cur.execute("""
                INSERT INTO suppliers (
                    id, name, city, country, ai_score, status, sector, 
                    current_phase, rfi, rfq, rfp
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                str(uuid4()), name, city, "Turkey", score, "discovered", "Paper Cup",
                1.0, rfi, rfq, rfp
            ))
            
    conn.commit()
    cur.close()
    conn.close()
    print("✨ Seeding completed.")

if __name__ == "__main__":
    seed()
