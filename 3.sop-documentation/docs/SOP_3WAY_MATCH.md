# 📘 SOP: 3-Way Match Otomasyon

> **SOP Kodu:** SOP-S2P-003  
> **Versiyon:** 1.0  
> **Tarih:** 2026-02-25  

---

## 1. Amaç

Fatura, Satın Alma Siparişi (PO) ve Depo Giriş Fişi (GR) arasındaki otomatik eşleştirme ve doğrulama sürecini tanımlar.

---

## 2. 3-Way Match Nedir?

```
Invoice (Fatura)  ←→  Purchase Order (Sipariş)  ←→  Goods Receipt (Teslimat)
     ₺12,500            ₺12,500                       480/500 adet
```

**Kontroller:**
1. **Tutar Eşleşmesi:** Fatura tutarı = PO tutarı (±%2 tolerans)
2. **Miktar Eşleşmesi:** Teslim edilen = Sipariş edilen
3. **IBAN Doğrulama:** Faturadaki IBAN = Kayıtlı tedarikçi IBAN'ı

---

## 3. Karar Matrisi

| Tutar | Miktar | IBAN | Sonuç |
|---|---|---|---|
| ✅ Eşleşiyor | ✅ Eşleşiyor | ✅ Eşleşiyor | **AUTO_APPROVED** |
| ✅ Eşleşiyor | ⚠️ Kısmi teslimat | ✅ Eşleşiyor | **REVIEW_REQUIRED** |
| ⚠️ ±%2-5 fark | ✅ Eşleşiyor | ✅ Eşleşiyor | **REVIEW_REQUIRED** |
| ❌ >%5 fark | Any | Any | **REJECTED** |
| Any | Any | ❌ Farklı IBAN | **FRAUD_ALERT** |

---

## 4. n8n Workflow Akışı

```
1. [Trigger] Invoice extracted (Document AI'dan)
2. [PostgreSQL] PO'yu çek (invoice.po_number ile)
3. [PostgreSQL] Goods Receipt'i çek (po_id ile)
4. [Function] Rule-based pre-check:
   - amount_diff = |invoice.total - po.total|
   - amount_pct = amount_diff / po.total × 100
   - iban_match = invoice.iban == supplier.iban
5. [HTTP Request] Vertex AI API call:
   - Input: invoice + PO + GR data
   - Output: verdict, confidence, risk_score, reasoning
6. [Switch] Verdict bazında yönlendir:
   - "approved" → Payment trigger
   - "review_required" → Notification (email/Slack)
   - "fraud_alert" → Alert + Block payment
7. [PostgreSQL] match_results tablosuna INSERT
8. [PostgreSQL] audit_log tablosuna INSERT
```

---

## 5. Vertex AI Prompt

```
You are a financial controller performing a 3-Way Match.

INVOICE:
- Number: {{invoice_number}}
- Amount: {{invoice_total}} {{currency}}
- Tax: {{tax_amount}}
- IBAN: {{invoice_iban}}
- Date: {{invoice_date}}

PURCHASE ORDER:
- PO Number: {{po_number}}
- Amount: {{po_total}} {{currency}}
- Items: {{po_line_items}}

GOODS RECEIPT:
- GR Number: {{gr_number}}
- Received: {{received_items}}

SUPPLIER ON FILE:
- IBAN: {{registered_iban}}

Rules:
- Amount tolerance: ±2%
- IBAN must match exactly
- Partial delivery requires human review

Return JSON:
{
  "verdict": "approved|review_required|rejected|fraud_alert",
  "confidence": 0.0-1.0,
  "risk_score": 0-100,
  "reasoning": "...",
  "fraud_indicators": []
}
```

---

## 6. KPI'lar

| KPI | Hedef |
|---|---|
| Auto-approval rate | >%80 |
| False positive (yanlış alarm) | <%5 |
| Processing time | <15 saniye/fatura |
| Fraud detection rate | >%95 |

---

> **Bağlantılı:** `SOP_DOCUMENT_AI_SETUP.md`, `SOP_N8N_VERTEX_AI.md`
