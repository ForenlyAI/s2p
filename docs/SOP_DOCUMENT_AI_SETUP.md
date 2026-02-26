# 📘 SOP: Google Document AI — Fatura Parse Kurulumu

> **SOP Kodu:** SOP-S2P-002  
> **Versiyon:** 1.0  
> **Tarih:** 2026-02-25  

---

## 1. Amaç

Google Document AI kullanarak PDF faturaları otomatik olarak yapılandırılmış veriye dönüştürmek.

---

## 2. Adımlar

### 2.1 Processor Oluşturma

1. GCP Console → **Document AI** → **Create Processor**
2. **Type:** Invoice Parser (pre-trained)
3. **Region:** EU (GDPR compliance)
4. **Name:** `s2p-invoice-parser`
5. Processor ID'yi kopyala

### 2.2 Service Account Yetkilendirme

```bash
# Document AI rolü ekle
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:n8n-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/documentai.apiUser"
```

### 2.3 n8n Workflow Kurulumu

1. n8n → **New Workflow** → "Invoice OCR"
2. **Trigger:** Google Cloud Storage Trigger (yeni dosya)
3. **HTTP Request Node:**
   - Method: POST
   - URL: `https://eu-documentai.googleapis.com/v1/projects/PROJECT/locations/eu/processors/PROCESSOR_ID:process`
   - Auth: OAuth2 (GCP Service Account)
   - Body: `{"rawDocument": {"content": "{{base64}}", "mimeType": "application/pdf"}}`
4. **Function Node:** Response'dan alanları çıkar
5. **PostgreSQL Node:** `invoices` tablosuna INSERT

### 2.4 Çıkarılan Alanlar

| Alan | Document AI Field | Örnek |
|---|---|---|
| Fatura No | `invoice_id` | FTR-2026-0042 |
| Tarih | `invoice_date` | 2026-02-15 |
| Vade | `due_date` | 2026-03-15 |
| Toplam | `total_amount` | 12500.00 |
| KDV | `total_tax_amount` | 2500.00 |
| Tedarikçi | `supplier_name` | ABC Filtre Ltd. |
| IBAN | `receiver_account` | TR33... |

### 2.5 Test

1. Sample PDF faturayı `gs://bucket/invoices/` içine upload et
2. n8n workflow execution geçmişini kontrol et
3. Cloud SQL'de `invoices` tablosunu sorgula
4. Extraction confidence > 0.95 olmalı

---

## 3. Troubleshooting

| Sorun | Çözüm |
|---|---|
| Low confidence (<0.90) | PDF kalitesini kontrol et, scan ayarlarını iyileştir |
| Missing fields | Custom processor train et (10+ sample ile) |
| API limit | Quota artışı talep et |
| Turkish characters | UTF-8 encoding doğrula |

---

> **Bağlantılı SOP:** `SOP_3WAY_MATCH.md` (çıkarılan veri ile match)
