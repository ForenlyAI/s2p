import time
import os
import psycopg2
from uuid import UUID

# Configuration
DB_URL = "host=localhost dbname=s2p user=postgres password=postgres_pass_2026"

def print_header(text):
    print(f"\n{'='*60}")
    print(f"📦 {text.upper()}")
    print(f"{'='*60}")

def run_p2p_workshop():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    try:
        print_header("S2P Workshop: Module 2 - Procure to Pay (P2P)")
        
        # 1. Step: Active Supplier Selection
        cur.execute("SELECT id, name FROM suppliers WHERE status = 'active' LIMIT 1")
        supplier = cur.fetchone()
        if not supplier:
            print("❌ Aktif tedarikçi yok. Önce S2C modülünü çalıştırın.")
            return
        
        supplier_id, supplier_name = supplier
        print(f"[Step 1/3] Talep (PR) oluşturuluyor... Tedarikçi: {supplier_name}")

        # 2. Step: Create Purchase Order (PO)
        po_number = f"PO-2026-{os.urandom(2).hex().upper()}"
        cur.execute("""
            INSERT INTO purchase_orders (
                po_number, supplier_id, subtotal, total_amount, 
                line_items, status, created_by, order_date
            ) VALUES (%s, %s, 4500.00, 5400.00, 
                '[{"item": "Laptop Air 13 M3", "qty": 1, "price": 4500}]'::jsonb, 
                'sent', 'Selin Demir', CURRENT_DATE)
            RETURNING id;
        """, (po_number, supplier_id))
        po_id = cur.fetchone()[0]
        
        print(f"\n[Step 2/3] PO Üretildi: {po_number}")
        print(f"📄 PDF oluşturuldu: storage/pos/{po_number}.pdf (Simüle edildi)")
        time.sleep(1.5)

        # 3. Step: Goods Receipt (GR) - Mal Kabul
        print(f"\n[Step 3/3] Ürünler depoya ulaştı. Mal Kabul (GR) yapılıyor...")
        gr_number = f"GR-2026-{os.urandom(2).hex().upper()}"
        cur.execute("""
            INSERT INTO goods_receipts (
                gr_number, po_id, supplier_id, received_by, 
                status, line_items, quality_check
            ) VALUES (%s, %s, %s, 'Depo Sorumlusu Ahmet', 
                'received', '[{"item": "Laptop Air 13 M3", "qty": 1}]'::jsonb, 'passed')
            RETURNING id;
        """, (gr_number, po_id, supplier_id, ))
        
        print(f"✅ Mal Kabul Başarılı: {gr_number}")
        cur.execute("UPDATE purchase_orders SET status = 'received' WHERE id = %s", (po_id,))
        
        conn.commit()
        print_header("P2P Workshop Tamamlandı")

    except Exception as e:
        conn.rollback()
        print(f"❌ Hata: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_p2p_workshop()
