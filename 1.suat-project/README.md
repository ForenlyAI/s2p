# 🏗️ Suat Ak — Kahve Filtre S2P Projesi

> **Müşteri:** Suat Ak  
> **Sektör:** Perakende (Kahve Filtre Tedarik Zinciri)  
> **Başlangıç:** 2026-02-25  
> **Durum:** 🟡 Altyapı Kurulum Aşaması  

---

## 🎯 Proje Kapsamı (Scope)

Suat Ak'ın kahve filtre tedarik sürecinin **Source-to-Pay (S2P)** pipeline ile uçtan uca otomasyonu.

### Problem
- Tedarikçi bulma ve değerlendirme **manuel** yapılıyor
- Fatura kontrolü **elle** yapılıyor → hata riski yüksek
- Ödeme süreçlerinde **görünürlük** yok
- **3-Way Match** (Fatura vs Sipariş vs Teslimat) yapılmıyor

### Çözüm
GCP-native, AI-powered S2P pipeline:

```
Tedarikçi Bulma → Sipariş → Teslimat → Fatura → 3-Way Match → Ödeme
     (AI)           (Auto)    (Manual)    (OCR)      (AI)       (Auto)
```

---

## 🏗️ Mimari

| Katman | GCP Servisi | Rol |
|---|---|---|
| **Compute** | Compute Engine (VM) | n8n kurulumu |
| **AI & LLM** | Vertex AI (Gemini) | Tedarikçi analizi, 3-Way Match |
| **Document** | Google Document AI | Fatura OCR & extraction |
| **Database** | Cloud SQL (PostgreSQL) | Tüm veri kaydı |
| **Storage** | Cloud Storage | PDF faturalar & sözleşmeler |
| **Analytics** | Looker Studio | ROI dashboard |

---

## 📁 Dizin Yapısı

```
1.suat-ak-project/
├── README.md                    ← Bu dosya
├── architecture.md              ← Detaylı GCP mimari dokümanı
├── n8n-workflows/               ← n8n workflow JSON'ları
│   ├── 01_supplier_discovery.json
│   ├── 02_po_creation.json
│   ├── 03_invoice_processing.json
│   └── 04_three_way_match.json
├── document-ai/                 ← Document AI test dosyaları
│   ├── sample_invoices/
│   └── extraction_results/
├── sql/                         ← Veritabanı şemaları
│   └── schema.sql              ✅ Tamamlandı
└── reports/                     ← Suat Ak'a sunumlar
    └── roi_report.md
```

---

## 🚀 Milestone'lar

| # | Milestone | Hedef Tarih | Durum |
|---|---|---|---|
| M1 | GCP altyapı kurulumu | Şubat 2026 sonu | 🟡 |
| M2 | Veritabanı şeması deploy | Şubat 2026 sonu | ✅ Schema hazır |
| M3 | Document AI POC | Mart 2026 başı | ⬜ |
| M4 | Supplier Discovery workflow | Mart 2026 ortası | ⬜ |
| M5 | 3-Way Match demo | Mart 2026 ortası | ⬜ |
| M6 | End-to-End pipeline | Mart 2026 sonu | ⬜ |
| M7 | Looker Studio dashboard | Mart 2026 sonu | ⬜ |
| M8 | Müşteri sunumu & ROI raporu | Nisan 2026 başı | ⬜ |

---

## 💰 ROI Hedefleri

| Metrik | Mevcut (Manuel) | Hedef (Otomasyon) | İyileşme |
|---|---|---|---|
| Fatura kontrol süresi | ~4 saat/fatura | ~12 dakika | %95 ↓ |
| Tedarikçi değerlendirme | ~2 gün | ~30 dakika | %97 ↓ |
| Ödeme hatası oranı | ~%5 | <%0.5 | %90 ↓ |
| Fraud tespiti | Yok | Otomatik | ∞ |
| Yönetici görünürlüğü | Aylık Excel | Real-time dashboard | — |

---

> **Proje Sahibi:** Bahadir Ciloglu — Forenly AI
