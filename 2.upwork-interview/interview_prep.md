# 🎤 Mülakat Hazırlığı — S2P Sr. Consultant

> **Durum:** 🟡 Hazırlanıyor  
> **Hedef:** Upwork Enterprise Client — Sr. Business Process Consultant  

---

## 1. Teknik Sorular & Cevaplar

### Q1: "What S2P experience do you have?"
> "End-to-end S2P: AI vendor discovery, automated PO, Document AI invoicing, 3-Way Match with Vertex AI, payment orchestration. Reduced invoice processing from 4 hours to 12 minutes."

### Q2: "Why GCP?"
> "Document AI is the best invoice parser (handles Turkish invoices), Vertex AI Gemini's large context window is perfect for 3-Way Match, and EU regions guarantee data sovereignty."

### Q3: "How do you do the 3-Way Match?"
> "Three layers: (1) Document AI extracts invoice data, (2) Rule-based pre-check (±2% tolerance), (3) Vertex AI analyzes edge cases and outputs verdict: auto-approve (85%), manual review (12%), fraud alert (3%)."

### Q4: "ERP integration?"
> "'Strategic Intelligence Layer' approach — we don't replace ERPs (SAP/Oracle/ServiceNow), we augment them with AI. ERP stays system of record, AI handles decision-making."

### Q5: "Change management?"
> "Pilot-Prove-Scale: Week 1-2 pilot on invoice matching, Week 3-4 measure ROI, Week 5+ expand and create SOPs."

---

## 2. STAR Stories

### Challenging S2P Project
- **S:** Retail client, 500+ invoices/month, all manual, 5% error rate
- **T:** Automate invoice processing with financial controls
- **A:** Built GCP pipeline: Document AI + Vertex AI + FastAPI (Python-Native) + PostgreSQL + Looker Studio
- **R:** 95% time reduction, 0.3% error rate, caught 3 fraud invoices, ROI in 6 weeks

### Convincing Stakeholders
- **S:** Finance team resistant to AI invoice matching
- **T:** Win confidence without forcing transition
- **A:** Proposed 2-week parallel run (AI + manual comparison)
- **R:** AI matched/outperformed in 98% cases, team became advocates

---

## 3. Key Terminology

| Term | Meaning |
|---|---|
| S2P / P2P | Source-to-Pay / Procure-to-Pay |
| 3-Way Match | Invoice vs PO vs Goods Receipt |
| GRN | Goods Receipt Note |
| AP/AR | Accounts Payable/Receivable |
| Touchless Processing | No human intervention |
| Maverick Spending | Unauthorized purchases |
| Tail Spend | Low-value, high-volume spend |
| Data Sovereignty | Data stays in client's cloud |

---

## 4. Questions to Ask Them

1. "What's the current S2P maturity level?"
2. "Which ERP/financial system is in use?"
3. "Monthly invoice volume and average value?"
4. "Specific compliance requirements (GDPR, SOX)?"
5. "Team openness to AI automation?"
6. "What does success look like in 90 days?"

---

> **Son güncelleme:** 2026-02-25
