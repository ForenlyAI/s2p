import os
import json
import requests
import psycopg2
from uuid import UUID

# Configuration
DB_URL = "host=localhost dbname=s2p user=postgres password=postgres_pass_2026"
GEMINI_API_KEY = "AIzaSyB0lSn7NZb3ro3dbeZcULGvPmxbJuoarUc"

def qualify_and_contract(supplier_id: str):
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    try:
        # 1. Get Supplier Data
        cur.execute("SELECT name, address FROM suppliers WHERE id = %s", (supplier_id,))
        supplier = cur.fetchone()
        if not supplier:
            print(f"Supplier {supplier_id} not found.")
            return
        
        supplier_name, supplier_address = supplier
        print(f"Qualifying supplier: {supplier_name}")

        # 2. Update Status
        cur.execute("UPDATE suppliers SET status = 'active' WHERE id = %s", (supplier_id,))

        # 3. Generate Contract Content via AI
        prompt = f"Create a brief legal contract summary for a partnership between Forenly AI and {supplier_name} located at {supplier_address}. Focus on IT services, 1-year duration, and confidential handling of data. Return as a short paragraph."
        
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.7}
            }
            
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            contract_content = response.json()['candidates'][0]['content']['parts'][0]['text']
        except Exception as ai_err:
            print(f"AI generation failed, using fallback: {ai_err}")
            contract_content = f"Standard Master Services Agreement between Forenly AI and {supplier_name}. Scope: Generalized IT Support and Hardware Maintenance. Duration: 12 months. Value: 50,000 USD."

        # 4. Insert Contract
        cur.execute("""
            INSERT INTO contracts (supplier_id, title, content, start_date, end_date, status, value)
            VALUES (%s, %s, %s, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', 'active', 50000.00)
            RETURNING id;
        """, (supplier_id, f"Master Services Agreement - {supplier_name}", contract_content))
        
        contract_id = cur.fetchone()[0]
        conn.commit()
        
        print(f"Successfully qualified supplier and created contract: {contract_id}")
        return contract_id

    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    # Using the ID from Eymenler Notebook Servisi
    TARGET_ID = "7912dcda-6e94-4b23-8e94-768145e6c818"
    qualify_and_contract(TARGET_ID)
