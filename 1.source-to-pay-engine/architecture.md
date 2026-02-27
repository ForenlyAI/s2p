# 🏗️ GCP Architecture — S2P Pipeline

> **Proje:** Enterprise Pilot Client Kahve Filtre S2P  
> **Cloud:** Google Cloud Platform  
> **Region:** europe-west1 (Belgium) — Low latency for Turkey  
> **Tarih:** 2026-02-25  

---

## 1. Genel Mimari Bakış

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    GCP PROJECT: s2p-pilotak-prod                         │
│                                                                         │
│  ┌──────────────┐                                                       │
│  │   PHASE 1    │     SOURCE & PROCURE                                  │
│  │  ┌─────────┐ │                                                       │
│  │  │ Google  │ │──→ n8n (Compute Engine) ──→ Vertex AI (Score)         │
│  │  │ Maps API│ │                                    │                   │
│  │  └─────────┘ │                                    ▼                   │
│  └──────────────┘                          Cloud SQL (PostgreSQL)        │
│                                            ┌───────────────────┐        │
│                                            │ • suppliers       │        │
│                                            │ • purchase_orders │        │
│                                            │ • goods_receipts  │        │
│  ┌──────────────┐                          │ • invoices        │        │
│  │   PHASE 2    │     PAY                  │ • match_results   │        │
│  │  ┌─────────┐ │                          │ • payments        │        │
│  │  │ Cloud   │ │──→ Document AI ─┐        │ • audit_log       │        │
│  │  │ Storage │ │    (OCR/Parse)   │        └───────┬───────────┘        │
│  │  │ (PDF)   │ │                  ▼                │                    │
│  │  └─────────┘ │    Vertex AI ◀───┘                │                    │
│  │              │    (3-Way Match)                   │                    │
│  │              │         │                          │                    │
│  │              │         ▼                          ▼                    │
│  │              │    n8n (Payment) ──→ Craftgate   Looker Studio         │
│  │              │                      (Gateway)   (Dashboard)           │
│  └──────────────┘                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. GCP Servisler — Detay

### 2.1 Compute Engine (n8n Orkestrasyon)

| Parametre | Değer |
|---|---|
| Machine type | e2-medium (2 vCPU, 4GB RAM) |
| Boot disk | 50GB SSD |
| OS | Ubuntu 22.04 LTS |
| n8n version | Latest stable |
| Deployment | Docker Compose |
| Domain | n8n.pilotak.forenly.ai (Caddy reverse proxy) |
| Auto-restart | Enabled (systemd) |

**Docker Compose Stack:**
```yaml
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=n8n.pilotak.forenly.ai
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.pilotak.forenly.ai/
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=cloud-sql-proxy
      - DB_POSTGRESDB_DATABASE=n8n
    volumes:
      - n8n_data:/home/node/.n8n
    restart: always

  cloud-sql-proxy:
    image: gcr.io/cloud-sql-connectors/cloud-sql-proxy:2.8.0
    command: "s2p-pilotak-prod:europe-west1:s2p-db"
    restart: always

  caddy:
    image: caddy:2
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
    restart: always
```

### 2.2 Cloud SQL (PostgreSQL)

| Parametre | Değer |
|---|---|
| Database version | PostgreSQL 15 |
| Tier | db-f1-micro (başlangıç) → db-g1-small (production) |
| Storage | 10GB SSD (auto-increase) |
| Region | europe-west1 |
| High availability | Off (başlangıç) |
| Backup | Daily automated |
| Connection | Cloud SQL Auth Proxy |

**Databases:**
- `s2p_prod` — Production S2P pipeline data
- `n8n` — n8n internal data

### 2.3 Cloud Storage

| Bucket | Amaç |
|---|---|
| `s2p-pilotak-invoices` | Gelen PDF faturalar |
| `s2p-pilotak-contracts` | Tedarikçi sözleşmeleri |
| `s2p-pilotak-exports` | Raporlar & export dosyaları |

**Lifecycle Rules:**
- Faturalar → 90 gün sonra Nearline storage'a taşı
- Sözleşmeler → 365 gün sonra Archive storage'a taşı

### 2.4 Document AI

| Parametre | Değer |
|---|---|
| Processor type | Invoice Parser (Pre-trained) |
| Region | eu (GDPR compliance) |
| Output | JSON (structured extraction) |

**Çıkarılan Alanlar:**
- `invoice_number` — Fatura numarası
- `invoice_date` — Fatura tarihi
- `due_date` — Vade tarihi
- `supplier_name` — Tedarikçi adı
- `total_amount` — Toplam tutar
- `tax_amount` — KDV tutarı
- `line_items` — Kalem detayları
- `iban` — IBAN (bank info from footer)

### 2.5 Vertex AI

| Parametre | Değer |
|---|---|
| Model | gemini-1.5-pro |
| Region | europe-west1 |
| Use cases | Supplier scoring, 3-Way Match, Fraud detection |
| Temperature | 0.1 (deterministic for financial ops) |

**Kullanım Senaryoları:**

1. **Supplier Scoring Prompt:**
```
You are a procurement analyst. Evaluate this supplier based on:
- Price competitiveness (0-100)
- Quality indicators from their website (0-100)
- Location proximity to Istanbul (0-100)

Supplier data: {json}
Return JSON: {"price_score": X, "quality_score": X, "location_score": X, "composite_score": X, "reasoning": "..."}
```

2. **3-Way Match Prompt:**
```
You are a financial controller. Compare:
- Invoice: {invoice_data}
- Purchase Order: {po_data}
- Goods Receipt: {gr_data}

Check:
1. Amount match (tolerance: 2%)
2. Quantity match
3. IBAN consistency

Return JSON: {"verdict": "approved|review_required|rejected|fraud_alert", "confidence": 0.0-1.0, "risk_score": 0-100, "reasoning": "...", "fraud_indicators": [...]}
```

### 2.6 Looker Studio

| Dashboard | İçerik |
|---|---|
| **Executive Summary** | Total spend, payment velocity, fraud alerts |
| **Supplier Intelligence** | AI scores, order frequency, risk levels |
| **Invoice Pipeline** | Status funnel, processing time, match rates |
| **Financial Health** | Monthly trends, budget vs actual, forecasting |

---

## 3. Data Flow — Detaylı Akış

### Flow 1: Supplier Discovery → PO

```
1. [TRIGGER] Manuel tetikleme veya haftalık cron
2. [n8n] Google Maps API → "kahve filtre tedarikçisi İstanbul" araması
3. [n8n] Her tedarikçi için web scraping (website bilgisi)
4. [n8n] Vertex AI'a tedarikçi verisi gönder → Puanlama al
5. [n8n] Score > 70 ? → Cloud SQL'e "qualified" olarak kaydet
6. [n8n] Slack/Email notification → "3 yeni tedarikçi bulundu"
7. [MANUAL] Enterprise Pilot Client onaylar → status = "approved"
8. [n8n] Onaylanan tedarikçiye PO oluştur → Cloud SQL INSERT
```

### Flow 2: Invoice → 3-Way Match → Payment

```
1. [TRIGGER] PDF fatura Cloud Storage'a upload edilir
2. [n8n] Cloud Storage trigger → yeni dosya algılanır
3. [n8n] Document AI çağrılır → PDF'den veri çıkarılır
4. [n8n] Çıkarılan veri Cloud SQL invoices tablosuna INSERT
5. [n8n] invoice.po_number ile PO eşleştirilir
6. [n8n] goods_receipts tablosundan GR alınır
7. [n8n] Vertex AI → 3-Way Match analizi
8. [n8n] match_results tablosuna INSERT
9. [DECISION]
   - verdict = "approved" → Otomatik ödeme trigger'ı
   - verdict = "review_required" → Enterprise Pilot Client'a bildirim
   - verdict = "fraud_alert" → Acil alarm + blokaj
10. [n8n] Ödeme emri → Craftgate API / Simülasyon
11. [n8n] payments tablosuna INSERT
12. [n8n] Audit log kaydı
```

---

## 4. Güvenlik (Security)

### IAM & Service Accounts

| Service Account | Roller |
|---|---|
| `n8n-sa@project` | `roles/cloudsql.client`, `roles/storage.objectViewer`, `roles/documentai.apiUser`, `roles/aiplatform.user` |
| `docai-sa@project` | `roles/documentai.editor`, `roles/storage.objectViewer` |

### Network

- VPC ile private network
- Cloud SQL: Private IP only (no public access)
- Firewall rules: Only 80/443 for n8n UI, SSH via IAP only
- Cloud Storage: Uniform bucket-level access

### Data Sovereignty

- Tüm veri `europe-west1` region'da kalır
- Document AI `eu` multi-region kullanır
- Customer Managed Encryption Keys (CMEK) → Opsiyonel

---

## 5. Maliyet Tahmini (Monthly)

| Servis | Tahmin | Not |
|---|---|---|
| Compute Engine (e2-medium) | ~$25/ay | Always-on |
| Cloud SQL (db-f1-micro) | ~$10/ay | Başlangıç tier |
| Cloud Storage | ~$1/ay | < 1GB başlangıç |
| Document AI | ~$5/ay | ~100 fatura/ay |
| Vertex AI (Gemini) | ~$10/ay | ~500 API call/ay |
| Networking | ~$2/ay | Egress |
| **TOPLAM** | **~$53/ay** | **Başlangıç maliyeti** |

> 💡 Enterprise Pilot Client'a sunumda: "Aylık ~$50 altyapı maliyeti ile 4 saat/fatura × 100 fatura = 400 saat/ay'lık manuel çalışmayı eliminate ediyoruz."

---

## 6. Deployment Checklist

- [ ] GCP Project oluştur: `s2p-pilotak-prod`
- [ ] Billing account bağla
- [ ] API'ları etkinleştir: Compute, Cloud SQL, Storage, Document AI, Vertex AI
- [ ] Service Account oluştur ve yetkilendir
- [ ] VPC oluştur: `s2p-vpc`
- [ ] Compute Engine VM oluştur
- [ ] Cloud SQL instance oluştur
- [ ] `schema.sql` deploy et
- [ ] Cloud Storage bucket'ları oluştur
- [ ] n8n Docker stack deploy et
- [ ] Document AI processor oluştur
- [ ] DNS ayarları: `n8n.pilotak.forenly.ai`
- [ ] SSL sertifikası (Caddy auto)
- [ ] İlk workflow'u test et

---

> **Doküman Sahibi:** Bahadir Ciloglu — Forenly AI  
> **Son güncelleme:** 2026-02-25
