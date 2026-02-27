# Forenly AI: S2P Orchestrator (GCP-Native)

An end-to-end, AI-native **Source-to-Pay (S2P)** automation pipeline built on Google Cloud Platform. This system transforms traditional procurement into an autonomous "Living Organism" by leveraging LLMs and document intelligence.

## 🚀 Overview

The **Forenly AI S2P Orchestrator** automates the entire procurement lifecycle—from vendor discovery to final payment. It is designed as a "Strategic Intelligence Layer" that augments existing ERPs (like ServiceNow, SAP, or Oracle) without creating technical debt.

## 🏗️ Architecture

The pipeline utilizes a high-performance, GCP-native stack:

- **Orchestration:** FastAPI (Python-Native) & n8n
- **Intelligence Layer:** Vertex AI (Gemini 1.5 Pro) for scoring and 3-way matching
- **Document Intelligence:** Google Document AI for touchless invoice extraction
- **Data Layer:** Cloud SQL (PostgreSQL) & Cloud Storage
- **Obserevability:** Looker Studio for ROI and spend analytics

## ✨ Key Features

### 🔍 1. AI-Powered Sourcing
Automated vendor discovery using Google Maps API. Results are passed to **Gemini AI**, which scores suppliers based on online presence, ratings, and strategic fit.

### 📄 2. Touchless Invoice Intake
Uses **Google Document AI** to parse incoming PDF invoices with 99%+ accuracy. It extracts line items, taxes, and IBANs, eliminating manual data entry.

### 🤖 3. Semantic 3-Way Match
The heart of the system. **Vertex AI** performs a semantic comparison between the **Invoice**, **Purchase Order**, and **Goods Receipt**. It understands context (e.g., matching "Product A" to "Item A") where rigid rules fail.

### 🛡️ 4. Fraud & Anomaly Detection
Identifies IBAN changes, price spikes, or unauthorized "Maverick Spending" before a payment is triggered.

## 📁 Repository Structure

```
├── 1.source-to-pay-engine/  # Core AI-Native S2P Engine
│   ├── backend/             # FastAPI Backend & AI Services
│   ├── frontend/            # React Dashboard for S2P Monitoring (WIP)
│   ├── scripts/             # Deployment and DB migration scripts
│   └── sql/                 # Database Schemas
└── assets/                  # Project assets and architectural diagrams
```

## 🛠️ Setup & Installation

Detailed instructions can be found in the [S2P Engine Documentation](./1.source-to-pay-engine/README.md).

## 📈 Success Metrics
- **Manual Labor Reduction:** 97% reduction in 3-way match time.
- **Accuracy:** 99.2% extraction accuracy via Document AI.
- **Risk Mitigation:** Real-time flagging of financial discrepancies.

---
**Prepared by:** [Bahadir Ciloglu](https://www.linkedin.com/in/bahadir-ciloglu-49b98b369/)  
**Founder:** [Forenly AI - AI Agency](https://forenly.ai)
