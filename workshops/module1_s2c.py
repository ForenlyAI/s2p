import time
import os
import requests
import psycopg2
from uuid import UUID

# Configuration
DB_URL = "host=localhost dbname=s2p user=postgres password=postgres_pass_2026"
GEMINI_API_KEY = "AIzaSyB0lSn7NZb3ro3dbeZcULGvPmxbJuoarUc"

def print_header(text):
    print(f"\n{'='*60}")
    print(f"🚀 {text.upper()}")
    print(f"{'='*60}")

def run_s2c_workshop():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    try:
        print_header("S2P Workshop: Module 1 - Source to Contract (S2C)")
        
        # 1. Step: Selection
        print("[Step 1/4] En yüksek puanlı 'Discovered' durumundaki tedarikçiler listeleniyor...")
        cur.execute("SELECT id, name, ai_score, status FROM suppliers WHERE status = 'discovered' ORDER BY ai_score DESC LIMIT 1")
        target = cur.fetchone()
        
        if not target:
            print("❌ Uygun tedarikçi bulunamadı. Lütfen önce Discovery akışını çalıştırın.")
            return

        supplier_id, supplier_name, ai_score, status = target
        print(f"✅ Seçilen Tedarikçi: {supplier_name}")
        print(f"📊 AI Skoru: {ai_score}/100")
        time.sleep(1)

        # 2. Step: Approval
        print(f"\n[Step 2/4] Satın Alma Müdürü (Selin Demir) onayına sunuluyor...")
        time.sleep(1.5)
        cur.execute("UPDATE suppliers SET status = 'qualified', approved_by = 'Selin Demir', approved_at = NOW() WHERE id = %s", (supplier_id,))
        print(f"✅ ONAYLANDI: Tedarikçi durumu 'QUALIFIED' olarak güncellendi.")

        # 3. Step: Contract Generation (AI)
        print(f"\n[Step 3/4] AI (Gemini) ile Taslak Sözleşme oluşturuluyor...")
        prompt = f"Forenly AI ile {supplier_name} arasında 1 yıllık BT destek hizmetleri için kısa bir dijital sözleşme taslağı hazırla. Önemli maddeleri (Gizlilik, SLA, Ödeme Süresi) maddeler halinde belirt."
        
        contract_content = ""
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            response = requests.post(url, json=payload, timeout=10)
            if response.status_code == 200:
                contract_content = response.json()['candidates'][0]['content']['parts'][0]['text']
                print("✅ AI Sözleşme Taslağı Oluşturuldu.")
            else:
                raise Exception("AI Error")
        except:
            contract_content = f"Standard MSA for {supplier_name}. Terms: Net 30, Confidential, 12 Months Support."
            print("⚠️ AI ulaşılamadı, standart şablon kullanıldı.")

        # Insert into database
        cur.execute("""
            INSERT INTO contracts (supplier_id, title, content, status, value, start_date, end_date)
            VALUES (%s, %s, %s, 'draft', 120000.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year')
            RETURNING id;
        """, (supplier_id, f"MSA - {supplier_name[:30]}", contract_content))
        contract_id = cur.fetchone()[0]
        print(f"✅ Sözleşme Kaydedildi (ID: {contract_id})")

        # 4. Step: Digital Signing
        print(f"\n[Step 4/4] Dijital imza süreci başlatılıyor...")
        time.sleep(1)
        cur.execute("""
            UPDATE contracts 
            SET status = 'active', signed_by_supplier = TRUE, signed_by_company = TRUE, signed_at = NOW()
            WHERE id = %s;
        """, (contract_id,))
        cur.execute("UPDATE suppliers SET status = 'active' WHERE id = %s", (supplier_id,))
        
        print(f"✅ İMZALANDI: Sözleşme şu an AKTİF. Tedarikçi 'ACTIVE' listesine alındı.")
        
        conn.commit()
        print_header("S2C Workshop Tamamlandı")

    except Exception as e:
        conn.rollback()
        print(f"❌ Hata: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_s2c_workshop()
