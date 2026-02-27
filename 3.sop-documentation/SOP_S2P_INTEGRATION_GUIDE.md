# 📙 SOP: S2P Integration Guide (Enterprise Pilot Client Project Case)

> **SOP Kodu:** SOP-S2P-002  
> **Versiyon:** 1.0  
> **Oluşturan:** Forenly AI  
> **Tarih:** 2026-02-26  
> **Kategori:** Project Integration / S2P  

---

## 1. Executive Summary

Bu döküman, **Enterprise Pilot Client — Kahve Filtre S2P Projesi**'nin teknik entegrasyon sürecini ve kullanılan metodolojiyi özetler. Bu rehber, benzer S2P projelerinin Forenly AI standartlarında hızlıca ayağa kaldırılması için kullanılmalıdır.

---

## 2. Mimari Bileşenler

Proje üç ana katmandan oluşmaktadır:
1. **Frontend (React):** Veri görselleştirme ve operasyonel kontrol paneli.
2. **Backend (FastAPI):** İş mantığı, API yönetimi ve veritabanı orkestrasyonu.
3. **AI Services (Vertex AI & Document AI):** Tedarikçi puanlama ve fatura işleme.

---

## 3. Entegrasyon Adımları

### 3.1. Ortam Hazırlığı
- Python 3.10+ ve Node.js v18+ kurulumu.
- PostgreSQL veritabanı instance'ı (Local veya Cloud SQL).
- `.env` dosyalarının yapılandırılması (API Keys, DB URL).

### 3.2. Backend Entegrasyonu
- `backend/database.py` üzerinden `Supplier`, `Invoice`, `PO` modellerinin tanımlanması.
- `backend/services/` altında Google Maps (Discovery) ve Gemini (Scoring) servislerinin bağlanması.
- FastAPI endpointlerinin (`/discovery`, `/suppliers`, `/stats`) aktif edilmesi.

### 3.3. Frontend Entegrasyonu
- React uygulamasının backend API URL'ine bağlanması.
- `App.jsx` üzerinde dashboard bileşenlerinin (Supplier Grid, Stats Overview) render edilmesi.
- Gerçek zamanlı verinin (Axios/Fetch) state'e aktarılması.

---

## 4. Kullanılan Teknolojiler & Kütüphaneler

- **Backend:** FastAPI, SQLAlchemy, Pydantic, Uvicorn.
- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons.
- **AI/Cloud:** Google Cloud Vertex AI, Google Maps Places API.

---

## 5. Enterprise Pilot Client Projesi Özel Notları

- **Query:** "Coffee filter manufacturers Europe" aramasıyla başlangıç yapıldı.
- **Scoring Logic:** Sürdürülebilirlik, üretim kapasitesi ve lojistik lokasyon bazlı puanlama uygulandı.
- **Output:** 50+ nitelikli tedarikçi veri tabanına işlendi.

---

## 6. Sıkça Sorulan Sorular (SSS)

**S: Yeni bir sektör için nasıl özelleştirilir?**  
C: `backend/services/google_maps.py` içindeki search parametrelerini ve `ai_scoring.py` içindeki benchmark kriterlerini değiştirmeniz yeterlidir.

---

> **Ref:** `/home/macb/5.s2p/task.md`
