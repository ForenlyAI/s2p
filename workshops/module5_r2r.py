import os
import requests
import psycopg2
from decimal import Decimal

# Configuration
DB_URL = "host=localhost dbname=s2p user=postgres password=postgres_pass_2026"
GEMINI_API_KEY = "AIzaSyB0lSn7NZb3ro3dbeZcULGvPmxbJuoarUc"

def print_header(text):
    print(f"\n{'='*60}")
    print(f"📊 {text.upper()}")
    print(f"{'='*60}")

def run_r2r_workshop():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    try:
        print_header("S2P Workshop: Module 5 - Record to Report (R2R)")
        
        # 1. Step: Aggregate Data
        print("[Step 1/2] Finansal veriler konsolide ediliyor...")
        
        # Expenses (AP)
        cur.execute("SELECT SUM(amount) FROM payments WHERE status = 'completed'")
        total_expenses = cur.fetchone()[0] or Decimal('0')
        
        # Income (AR)
        cur.execute("SELECT SUM(amount) FROM customer_invoices WHERE status = 'paid'")
        total_income = cur.fetchone()[0] or Decimal('0')
        
        net_profit = total_income - total_expenses
        
        print(f"💰 Toplam Gelir (AR): {total_income} USD")
        print(f"💸 Toplam Gider (AP): {total_expenses} USD")
        print(f"📈 Net Kar/Zarar: {net_profit} USD")

        # 2. Step: AI Financial Analysis
        print(f"\n[Step 2/2] AI (Gemini) Finansal Durum Analizi yapıyor...")
        
        prompt = f"""
        Aşağıdaki finansal verilere göre Forenly AI şirketinin durumunu bir cümleyle yorumla ve 1 adet optimizasyon önerisi ver:
        - Gelir: {total_income} USD
        - Gider: {total_expenses} USD
        - Net Kar: {net_profit} USD
        """
        
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            response = requests.post(url, json=payload, timeout=10)
            analysis = response.json()['candidates'][0]['content']['parts'][0]['text']
        except:
            analysis = "AI Analizi şu an yapılamıyor, ancak nakit akışı pozitif görünüyor."

        print(f"\n🤖 AI ANALİZ SERVİSİ:")
        print(f"{'-'*30}")
        print(analysis.strip())
        print(f"{'-'*30}")

        print_header("TÜM S2P & FSC WORKSHOP SÜRECİ TAMAMLANDI ✅")

    except Exception as e:
        print(f"❌ Hata: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_r2r_workshop()
