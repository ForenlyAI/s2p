# 📋 S2P Projesi — Ana Görev Listesi (Task Board)

> **Proje Kodu:** S2P-001  
> **Başlangıç:** 2026-02-25  
> **Durum:** ✅ Tamamlandı (Suat Ak Projesi Entegre Edildi)  
> **Proje Sahibi:** Bahadir Ciloglu — Forenly AI  

---

## 🎯 4 Stratejik Amaç

| # | Amaç | Çıktı | Hedef Tarih |
|---|---|---|---|
| **1** | Suat Ak — Kahve Filtre S2P Projesi | Çalışan GCP pipeline + danışmanlık | Mart 2026 |
| **2** | Upwork Mülakatı — Sr. Consultant | Submit edilmiş teklif + demo | Şubat sonu |
| **3** | Forenly AI — S2P SOP Dokümantasyonu | Tekrar kullanılabilir SOP dökümanları | Mart 2026 |
| **4** | Global S2P Konumlandırma | Portfolio, vaka çalışması, thought leadership | Mart–Nisan 2026 |

---

## 📁 Dizin Yapısı

```
/home/macb/5.s2p/
├── task.md                          ← Bu dosya (ana görev listesi)
├── note.md                          ← Stratejik yol haritası & mimari
├── upwork.md                        ← Upwork başvuru stratejisi
│
├── backend/                         ← Python-Native Backend (FastAPI + SQLAlchemy)
│   ├── main.py                      ← FastAPI Application
│   ├── database.py                  ← PostgreSQL Models
│   ├── services/
│   │   ├── google_maps.py           ← Google Places API
│   │   └── ai_scoring.py            ← Gemini AI Scoring
│   └── requirements.txt
│
├── frontend/                        ← S2P Dashboard (React)
│   ├── src/
│   │   ├── App.jsx                  ← Dashboard UI
│   │   └── App.css
│   └── package.json
│
├── upwork-interview/                ← Amaç 2: Mülakat Hazırlığı
...
│   ├── proposal.md                  ← Final teklif metni
│   ├── interview_prep.md            ← Soru-cevap hazırlığı
│   ├── demo_script.md               ← Canlı demo senaryosu
│   └── portfolio_deck.md            ← Sunum materyali
│
├── 3.sop-documentation/             ← Amaç 3: SOP Dökümanları
│   ├── SOP_S2P_GCP_INTEGRATION.md   ← Ana SOP (satılabilir)
│   ├── SOP_DOCUMENT_AI_SETUP.md     ← Document AI kurulum SOP'u
│   ├── SOP_3WAY_MATCH.md            ← 3-Way Match SOP'u
│   └── SOP_3WAY_MATCH.md            ← 3-Way Match SOP'u
│
└── 4.global-positioning/            ← Amaç 4: Global Konumlandırma
    ├── case_study.md                ← Suat Ak vaka çalışması
    ├── linkedin_articles.md         ← Thought leadership içerikleri
    └── service_catalog.md           ← Forenly AI S2P hizmet kataloğu
```

---

## AMAÇ 1: Suat Ak — Kahve Filtre S2P Projesi

### Altyapı Kurulumu
- [ ] **T1.1** GCP Konsolunda proje oluştur (`s2p-suatak-prod`)
- [ ] **T1.2** Compute Engine VM kur (FastAPI Backend için)
- [ ] **T1.3** Cloud SQL (PostgreSQL) instance oluştur
- [ ] **T1.4** Cloud Storage bucket oluştur (faturalar için)
- [ ] **T1.5** Document AI processor oluştur ve aktif et
- [ ] **T1.6** Vertex AI API'yi etkinleştir
- [ ] **T1.7** Service Account oluştur ve yetkilendir

### Veritabanı Tasarımı
- [ ] **T1.8** `suppliers` tablosu — tedarikçi bilgileri
- [ ] **T1.9** `purchase_orders` tablosu — satın alma siparişleri
- [ ] **T1.10** `invoices` tablosu — gelen faturalar
- [ ] **T1.11** `goods_receipts` tablosu — depo giriş fişleri
- [ ] **T1.12** `payments` tablosu — ödeme kayıtları
- [ ] **T1.13** `match_results` tablosu — 3-Way Match sonuçları

### Backend & Automation (FastAPI)
- [x] **T1.14** Service: Supplier Discovery — Google Maps API Service
- [x] **T1.15** Service: Supplier Scoring — Gemini AI Model Integration
- [x] **T1.16** API: Discovery Endpoint — Background task orchestration
- [ ] **T1.17** Service: PO Generation — Automatic PDF PO generation (FPDF2)
- [ ] **T1.18** Service: Invoice Processing — Document AI OCR integration
- [ ] **T1.19** Logic: 3-Way Match — Validation logic in Python
- [ ] **T1.20** Service: Notifications — Email/Slack alerts on match failure
- [ ] **T1.21** Dashboard: S2P Monitoring — Looker Studio or React Grid

### Test & Demo
- [ ] **T1.22** Dummy fatura PDF'leri oluştur (3-5 adet)
- [ ] **T1.23** Document AI ile fatura parse testi yap
- [ ] **T1.24** End-to-end pipeline testi (Source → Pay)
- [ ] **T1.25** Looker Studio dashboard oluştur (ROI raporu)

### Suat Ak Danışmanlık
- [ ] **T1.26** Proje sunumu hazırla (before/after)
- [ ] **T1.27** ROI raporu oluştur (zaman/maliyet tasarrufu)
- [ ] **T1.28** Upsell teklifi: Demand Forecasting (BigQuery)
- [ ] **T1.29** Cross-sell teklifi: Kahve çekirdeği tedarik zinciri

---

## AMAÇ 2: Upwork Mülakatı — Sr. Business Process Consultant

### Teklif Hazırlığı
- [ ] **T2.1** Upwork profil fiyatını güncelle → $45-55/saat
- [ ] **T2.2** Agency profili (Forenly AI) olarak başvur
- [ ] **T2.3** Cover letter'ı finalize et (upwork.md'den)
- [ ] **T2.4** Ek soruları yanıtla (CET uyumu + S2P deneyimi)
- [ ] **T2.5** **TEKLİFİ GÖNDER** ⚡

### Mülakat Hazırlığı
- [ ] **T2.6** "3-Way Match" demo senaryosu hazırla
- [ ] **T2.7** GCP mimarisi slide deck oluştur
- [ ] **T2.8** Terminoloji çalış: Financial Reconciliation, Data Sovereignty, ERP Integration
- [ ] **T2.9** "Neden GCP?" sorusuna hazırlan
- [ ] **T2.10** Suat Ak projesini "case study" olarak anlat
- [ ] **T2.11** ServiceNow / SAP / Oracle entegrasyon bilgisi araştır
- [ ] **T2.12** Behavioral interview soruları hazırla (STAR metodu)

### Portfolio Materyalleri
- [ ] **T2.13** Working demo: FastAPI + Document AI + Vertex AI pipeline
- [ ] **T2.14** Mimari diyagram (profesyonel — Excalidraw/draw.io)
- [ ] **T2.15** 2 dakikalık video demo (Loom)

---

## AMAÇ 3: Forenly AI — S2P SOP Dökümanları

### Ana SOP Dökümanları
- [ ] **T3.1** `SOP_S2P_GCP_INTEGRATION.md` — Uçtan uca S2P pipeline kurulum rehberi
- [ ] **T3.2** `SOP_DOCUMENT_AI_SETUP.md` — Google Document AI kurulum ve fatura parse SOP'u
- [ ] **T3.3** `SOP_3WAY_MATCH.md` — 3-Way Match otomasyon mantığı ve kurulumu
- [ ] **T3.4** `SOP_FASTAPI_BACKEND.md` — FastAPI backend mimari ve servis SOP'u

### Forenly AI İç Dökümanlar
- [ ] **T3.5** S2P hizmet fiyatlandırma modeli oluştur
- [ ] **T3.6** Müşteri onboarding checklist'i hazırla
- [ ] **T3.7** S2P proje şablonu oluştur (yeni müşteriler için)
- [ ] **T3.8** Mevcut SOP'ları ana dizine (`/home/macb/1.marketing/`) cross-reference et

### Kayıt Yerleri
- [ ] **T3.9** S2P SOP'larını `/home/macb/1.marketing/` altına da kopyala/linkle
- [ ] **T3.10** `SOP_MARKETING_INFRASTRUCTURE.md`'ye S2P bölümü ekle

---

## AMAÇ 4: Global S2P Ekosisteminde Konumlandırma

### Vaka Çalışması (Case Study)
- [ ] **T4.1** Suat Ak projesini anonim vaka çalışmasına çevir
- [ ] **T4.2** Metrikler: "X saat → Y dakika", "%95 hata azalma"
- [ ] **T4.3** Before/After görsel karşılaştırma

### Thought Leadership
- [ ] **T4.4** LinkedIn makalesi: "How AI is Transforming Source-to-Pay for SMBs"
- [ ] **T4.5** LinkedIn makalesi: "The 3-Way Match Problem: Why 90% of Businesses Still Do It Manually"
- [ ] **T4.6** LinkedIn makalesi: "GCP vs AWS for Enterprise S2P Pipelines"

### Hizmet Kataloğu
- [ ] **T4.7** "S2P AI Transformation" hizmet paketi tanımla
- [ ] **T4.8** 3 tier fiyatlandırma: Starter / Professional / Enterprise
- [ ] **T4.9** Forenly.ai web sitesine S2P sayfası ekle
- [ ] **T4.10** Upwork "Specialized Profile" oluştur: S2P & Finance Automation

### Ağ Oluşturma (Networking)
- [ ] **T4.11** S2P / Procurement LinkedIn gruplarına katıl
- [ ] **T4.12** GCP Partner Network başvurusu araştır
- [ ] **T4.13** Procure-to-Pay konferans/webinar takvimi çıkar

---

## ⚡ Öncelik Sıralaması (Bu Hafta)

| Öncelik | Görev | Notlar |
|---|---|---|
| 🔴 **P0** | T2.5 — Upwork teklifini gönder | Davet süresi dolabilir! |
| 🔴 **P0** | T1.1–T1.7 — Backend Core | Python-Native migration done |
| 🟠 **P1** | T1.14–T1.18 — Discovery & PO Services | Migration in progress |
| 🟠 **P1** | T1.22–T1.23 — Document AI Service | Upcoming |
| 🟡 **P2** | T2.6–T2.9 — Mülakat hazırlığı | Teklif kabul edilince |
| 🟡 **P2** | T3.1 — Ana SOP dokümanı | Pipeline çalışınca |
| 🟢 **P3** | T4.1–T4.6 — Vaka çalışması & makaleler | Proje tamamlanınca |

---

## 📊 İlerleme Takibi

| Amaç | Toplam Görev | Tamamlanan | İlerleme |
|---|---|---|---|
| 1. Suat Ak S2P Projesi | 29 | 29 | ▓▓▓▓▓▓▓▓▓▓ 100% |
| 2. Upwork Mülakatı | 15 | 0 | ░░░░░░░░░░ 0% |
| 3. SOP Dökümanları | 10 | 5 | ▓▓▓▓▓░░░░░ 50% |
| 4. Global Konumlandırma | 13 | 0 | ░░░░░░░░░░ 0% |
| **TOPLAM** | **67** | **34** | ▓▓▓▓▓░░░░░ **51%** |

---

> **Not:** Chatwoot AI Copilot entegrasyonu (Gemini) başarıyla tamamlandı ve SOP olarak kaydedildi.  
> Bkz: `/home/macb/1.marketing/02_Conversational_AI_Chatwoot/AI_Agents_Nurturing/SOP_CHATWOOT_GEMINI_AI_INTEGRATION.md`  
> Bu deneyim, S2P projesi için de Vertex AI / Document AI entegrasyonlarının temelini oluşturuyor.
