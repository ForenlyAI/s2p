import os
import psycopg2
from uuid import UUID

DB_URL = "host=localhost dbname=s2p user=postgres password=postgres_pass_2026"

def run_3way_matching(po_id: str):
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    try:
        # 1. Get PO Amount
        cur.execute("SELECT supplier_id, total_amount FROM purchase_orders WHERE id = %s", (po_id,))
        po = cur.fetchone()
        if not po:
            print("PO not found.")
            return
        supplier_id, po_amount = po

        # 2. Get Invoice Amount
        cur.execute("SELECT total_amount, id FROM invoices WHERE po_id = %s", (po_id,))
        invoice = cur.fetchone()
        if not invoice:
            print("No invoice found for this PO.")
            return
        inv_amount, inv_id = invoice

        print(f"PO: {po_amount} | INV: {inv_amount}")

        # 3. Matching Logic (Simulating simple match for workshop)
        if po_amount == inv_amount:
            print("✅ 3-Way Match SUCCESS. Proceeding to Payment Approval.")
            cur.execute("UPDATE invoices SET status = 'paid' WHERE id = %s", (inv_id,))
            cur.execute("""
                INSERT INTO payments (payment_number, invoice_id, supplier_id, amount, payment_method, status) 
                VALUES (%s, %s, %s, %s, 'bank_transfer', 'completed')
            """, (f"PAY-{inv_id.hex[:6].upper()}", inv_id, supplier_id, inv_amount))
        else:
            print("❌ Match FAILED. Discrepancy detected.")

        conn.commit()

    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
    finally:
        cur.close()
        conn.close()

def setup_test_data(supplier_id: str):
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    try:
        cur.execute("SELECT name FROM users WHERE role = 'procurement_manager' LIMIT 1")
        user = cur.fetchone()
        buyer_name = user[0] if user else "Selin Demir"

        # 1. Create PO
        po_num = f"PO-2026-{os.urandom(3).hex().upper()}"
        cur.execute("""
            INSERT INTO purchase_orders (po_number, supplier_id, subtotal, total_amount, line_items, status, created_by)
            VALUES (%s, %s, 5000.00, 5000.00, '[]'::jsonb, 'sent', %s) RETURNING id;
        """, (po_num, supplier_id, buyer_name))
        po_id = cur.fetchone()[0]

        # 2. Create GR (Mal Kabul)
        gr_num = f"GR-{po_num[3:]}"
        cur.execute("""
            INSERT INTO goods_receipts (gr_number, po_id, supplier_id, received_by, status, line_items)
            VALUES (%s, %s, %s, %s, 'received', '[]'::jsonb)
        """, (gr_num, po_id, supplier_id, buyer_name))

        # 3. Create Invoice
        cur.execute("""
            INSERT INTO invoices (po_id, invoice_number, total_amount, tax_amount, due_date, status, supplier_id)
            VALUES (%s, %s, 5000.00, 900.00, CURRENT_DATE + 30, 'received', %s)
        """, (po_id, f"INV-{po_num[3:]}", supplier_id))

        conn.commit()
        return po_id
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    TARGET_SUPPLIER_ID = "7912dcda-6e94-4b23-8e94-768145e6c818"
    print("Setting up test data for PO / GR / INV...")
    po_id = setup_test_data(TARGET_SUPPLIER_ID)
    if po_id:
        print(f"Test data created. PO ID: {po_id}")
        print("Running 3-Way Matching...")
        run_3way_matching(po_id)
