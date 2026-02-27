# 📘 SOP: End-to-End S2P Pipeline — GCP Integration

> **SOP Kodu:** SOP-S2P-001  
> **Versiyon:** 1.0  
> **Oluşturan:** Forenly AI  
> **Tarih:** 2026-02-25  
> **Kategori:** Source-to-Pay Automation  

---

## 1. Amaç

Bu SOP, Google Cloud Platform üzerinde uçtan uca bir Source-to-Pay (S2P) pipeline kurulumunu adım adım anlatır. Tedarikçi bulmadan ödeme yönetimine kadar tüm süreci kapsar.

---

## 2. Kapsam

- Tedarikçi bulma ve AI puanlama
- Satın alma siparişi (PO) oluşturma
- Fatura alımı ve OCR ile veri çıkarma
- 3-Way Match otomasyonu
- Ödeme tetikleme
- Raporlama ve dashboard

---

## 3. Ön Koşullar

- [x] GCP hesabı (Billing aktif)
- [x] n8n bilgisi (workflow oluşturma)
- [x] Temel SQL bilgisi
- [ ] Domain (opsiyonel — n8n UI için)

---

## 4. Adım 1: GCP Proje Kurulumu

```bash
# Proje oluştur
gcloud projects create s2p-PROJECT-prod --name="S2P Pipeline"

# Billing bağla
gcloud billing projects link s2p-PROJECT-prod --billing-account=BILLING_ID

# API'ları etkinleştir
gcloud services enable \
  compute.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com \
  documentai.googleapis.com \
  aiplatform.googleapis.com \
  --project=s2p-PROJECT-prod
```

---

## 5. Adım 2: Compute Engine (n8n)

```bash
# VM oluştur
gcloud compute instances create n8n-server \
  --zone=europe-west1-b \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB \
  --tags=http-server,https-server

# Firewall kuralları
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80,tcp:443 \
  --target-tags=http-server,https-server
```

**VM üzerinde kurulum:**
```bash
# Docker kur
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Docker Compose kur
sudo apt install docker-compose-plugin

# n8n dizini oluştur
mkdir -p ~/n8n && cd ~/n8n
# docker-compose.yml dosyasını oluştur (bkz: architecture.md)
docker compose up -d
```

---

## 6. Adım 3: Cloud SQL

```bash
# PostgreSQL instance oluştur
gcloud sql instances create s2p-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=europe-west1 \
  --storage-size=10GB \
  --storage-auto-increase

# Database oluştur
gcloud sql databases create s2p_prod --instance=s2p-db

# User oluştur
gcloud sql users create s2p_admin \
  --instance=s2p-db \
  --password=SECURE_PASSWORD

# Schema deploy et
# schema.sql dosyasını Cloud SQL'e yükle
```

---

## 7. Adım 4: Cloud Storage

```bash
# Bucket'lar oluştur
gsutil mb -l europe-west1 gs://s2p-PROJECT-invoices/
gsutil mb -l europe-west1 gs://s2p-PROJECT-contracts/

# Lifecycle policy
gsutil lifecycle set lifecycle.json gs://s2p-PROJECT-invoices/
```

---

## 8. Adım 5: Document AI

1. GCP Console → Document AI → Create Processor
2. Tip: **Invoice Parser** (Pre-trained)
3. Region: **EU**
4. Processor ID'yi not al → n8n'de kullanılacak

**Test:**
```bash
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{"rawDocument": {"content": "BASE64_PDF", "mimeType": "application/pdf"}}' \
  "https://eu-documentai.googleapis.com/v1/projects/PROJECT/locations/eu/processors/PROCESSOR_ID:process"
```

---

## 9. Adım 6: n8n Workflow'ları

Her workflow için ayrı SOP mevcut:
- `SOP_DOCUMENT_AI_SETUP.md` — Fatura parse
- `SOP_3WAY_MATCH.md` — 3-Way Match mantığı
- `SOP_N8N_VERTEX_AI.md` — Vertex AI entegrasyonu

---

## 10. Doğrulama Checklist

- [ ] n8n UI erişilebilir (HTTPS)
- [ ] Cloud SQL bağlantısı çalışıyor
- [ ] Document AI test fatura parse edebiliyor
- [ ] Vertex AI API çağrısı başarılı
- [ ] Cloud Storage trigger çalışıyor
- [ ] End-to-end pipeline testi başarılı

---

> **İlgili dökümanlar:**  
> - Mimari: `1.pilot-client-project/architecture.md`  
> - Schema: `1.pilot-client-project/sql/schema.sql`  
> - Diğer SOP'lar: `3.sop-documentation/`
