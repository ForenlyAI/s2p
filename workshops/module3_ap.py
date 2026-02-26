import time
import os
import psycopg2
from uuid import UUID

# Configuration
DB_URL = "host=localhost dbname=s2p user=postgres password=postgres_pass_2026"

def print_header(text):
    print(f"\n{'='*60}")
    print(f"💰 {text.upper()}")
    print(f"{'='*60}")

def run_ap_workshop():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    try:
        print_header("S2P Workshop: Module 3 - Accounts Payable (AP)")
        
        # 1. Step: Get latest PO and GR to match
        cur.execute("""
            SELECT po.id, po.po_number, po.total_amount, po.supplier_id, gr.gr_number, gr.id
            FROM purchase_orders po
            JOIN goods_receipts gr ON po.id = gr.po_id
            WHERE po.status = 'received'
            ORDER BY po.created_at DESC LIMIT 1
        """)
        data = cur.fetchone()
        if not data:
            print("❌ Eşleştirilecek mal kabulü yapılmış sipariş bulunamadı.")
            return
        
        po_id, po_num, po_amt, supplier_id, gr_num, gr_id = data
        print(f"[Step 1/3] Fatura Alındı. Eşleşme Sorgulanıyor... (PO: {po_num}, GR: {gr_num})")
        time.sleep(1)

        # Create the Invoice
        from decimal import Decimal
        inv_num = f"INV-{po_num[3:]}"
        tax_amt = po_amt * Decimal('0.20')
        cur.execute("""
            INSERT INTO invoices (
                po_id, supplier_id, invoice_number, total_amount, 
                tax_amount, status, invoice_date, due_date
            ) VALUES (%s, %s, %s, %s, %s, 'received', CURRENT_DATE, CURRENT_DATE + 30)
            RETURNING id;
        """, (po_id, supplier_id, inv_num, po_amt, tax_amt))
        inv_id = cur.fetchone()[0]
        print(f"✅ Fatura Kaydedildi: {inv_num} (Tutar: {po_amt})")

        # 2. Step: 3-Way Matching Logic
        print(f"\n[Step 2/3] 3-Way Matching (PO vs GR vs Invoice) başlatılıyor...")
        time.sleep(1.5)
        
        # Simulating automated AI Check
        match_success = True # In our mock, they match perfectly
        if match_success:
            print(f"✅ MATCH SUCCESS: PO({po_amt}) == GR(OK) == INV({po_amt})")
            cur.execute("UPDATE invoices SET status = 'matched' WHERE id = %s", (inv_id,))
            
            # Record Match Result
            cur.execute("""
                INSERT INTO match_results (po_id, gr_id, invoice_id, status, ai_verdict)
                VALUES (%s, %s, %s, 'auto_approved', 'approved')
            """, (po_id, gr_id, inv_id))
        
        # 3. Step: Payment Execution (Mert Yılmaz - Finance)
        print(f"\n[Step 3/3] Ödeme Süreci (Mert Yılmaz - Finance)...")
        time.sleep(1)
        
        pay_num = f"PAY-{inv_num[4:]}"
        cur.execute("""
            INSERT INTO payments (
                payment_number, invoice_id, supplier_id, amount, 
                payment_method, status, bank_reference
            ) VALUES (%s, %s, %s, %s, 'bank_transfer', 'completed', 'REF-998877')
        """, (pay_num, inv_id, supplier_id, po_amt))
        
        cur.execute("UPDATE invoices SET status = 'paid' WHERE id = %s", (inv_id,))
        cur.execute("UPDATE purchase_orders SET status = 'completed' WHERE id = %s", (po_id,))
        
        print(f"✅ ÖDEME TAMAMLANDI: {pay_num}")
        print(f"🏦 Banka Referans No: REF-998877")

        conn.commit()
        print_header("AP Workshop Tamamlandı")

    except Exception as e:
        conn.rollback()
        print(f"❌ Hata: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_ap_workshop()
