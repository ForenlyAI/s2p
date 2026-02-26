import time
import os
import psycopg2
from uuid import UUID

# Configuration
DB_URL = "host=localhost dbname=s2p user=postgres password=postgres_pass_2026"

def print_header(text):
    print(f"\n{'='*60}")
    print(f"📈 {text.upper()}")
    print(f"{'='*60}")

def run_o2c_workshop():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    try:
        print_header("S2P Workshop: Module 4 - Order to Cash (O2C)")
        
        # 1. Step: Customer & Order Simulation
        cur.execute("SELECT id, name FROM customers LIMIT 1")
        customer = cur.fetchone()
        if not customer:
            print("❌ Müşteri bulunamadı.")
            return
        
        cust_id, cust_name = customer
        so_num = f"SO-2026-{os.urandom(2).hex().upper()}"
        print(f"[Step 1/3] Satış Siparişi Alındı: {so_num} | Müşteri: {cust_name}")

        cur.execute("""
            INSERT INTO sales_orders (customer_id, order_number, total_amount, status)
            VALUES (%s, %s, 15000.00, 'shipped') RETURNING id;
        """, (cust_id, so_num))
        so_id = cur.fetchone()[0]
        time.sleep(1)

        # 2. Step: Billing (Fatura Kesme)
        print(f"\n[Step 2/3] Müşteriye Fatura Kesiliyor (AR)...")
        inv_num = f"CINV-{so_num[3:]}"
        cur.execute("""
            INSERT INTO customer_invoices (so_id, invoice_number, amount, status, due_date)
            VALUES (%s, %s, 15000.00, 'unpaid', CURRENT_DATE + 15)
            RETURNING id;
        """, (so_id, inv_num))
        inv_id = cur.fetchone()[0]
        print(f"✅ Satış Faturası Üretildi: {inv_num}")
        time.sleep(1.5)

        # 3. Step: Collection (Tahsilat)
        print(f"\n[Step 3/3] Tahsilat Takibi (Collection)...")
        print(f"💰 Müşteriden (Global Tech Corp) ödeme alındı.")
        cur.execute("UPDATE customer_invoices SET status = 'paid' WHERE id = %s", (inv_id,))
        cur.execute("UPDATE sales_orders SET status = 'completed' WHERE id = %s", (so_id,))
        
        print(f"✅ TAHSİLAT BAŞARILI: Satış döngüsü tamamlandı.")

        conn.commit()
        print_header("O2C Workshop Tamamlandı")

    except Exception as e:
        conn.rollback()
        print(f"❌ Hata: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_o2c_workshop()
