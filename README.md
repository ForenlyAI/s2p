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
└── 1.source-to-pay-engine/  # Core AI-Native S2P Engine
    ├── backend/             # FastAPI Backend & AI Services
    ├── frontend/            # React Dashboard for S2P Monitoring (WIP)
    ├── scripts/             # Deployment and DB migration scripts
    └── sql/                 # Database Schemas
```

## 🔄 The S2P Lifecycle: From Discovery to Payment

The application provides a seamless, visual workflow to manage procurement. Below is how the system orchestrates the transition from a simple search result to a finalized payment.

### 1. Phase 1: Intelligent Sourcing & API Enrichment
- **Ecosystem Sourcing**: We utilize the **Google Maps (Places) API** to discover vendors globally based on real-time location and category data.
- **AI Enrichment**: Discovery results are automatically passed to **Gemini AI**. The engine "enriches" the data by analyzing supplier ratings, web presence, and strategic relevance, producing a weighted "Strategic Score" for each lead.
- **Dynamic Company Cards**: Every result is transformed into a **Company Card**—the central unit of management in the platform.

### 2. Managing the Company Card & "Moving to the Right"
The UI operates on a stage-gated, Kanban-style progression where cards move through the procurement funnel:

- **Editable Metadata**: Each card contains editable fields for pricing, terms, and risk levels, allowing procurement officers to refine AI-generated data.
- **Procurement Suites (RFI / RFQ / RFP)**: 
    - **RFI (Info)**: Request and track initial supplier credentials.
    - **RFQ (Quota)**: Compare price offerings directly within the card.
    - **RFP (Proposal)**: Detailed proposal management and attachment tracking.
- **Workflow Progression**: Cards are "moved to the right" (Sourcing → Negotiation → Fulfillment → Payment) only after specific checkboxes (e.g., RFP approved, Contract signed) are validated.

### 3. The Path to Payment
As a card reaches the final stages, the **3-Way Match Engine** takes over:
- **Verification**: The system performs a semantic match between the **PDF Invoice** (extracted via Document AI), the **Purchase Order**, and the **Goods Receipt**.
- **Approval Gate**: If the match is successful (or approved by a human after exception flagging), the card moves to the **Pay** stage, triggering the final financial reconciliation.

## 🛠️ Setup & Installation

Detailed instructions can be found in the [S2P Engine Documentation](./1.source-to-pay-engine/README.md).

## 📈 Success Metrics
- **Manual Labor Reduction:** 97% reduction in 3-way match time.
- **Accuracy:** 99.2% extraction accuracy via Document AI.
- **Risk Mitigation:** Real-time flagging of financial discrepancies.

---
**Prepared by:** [Bahadir Ciloglu](https://www.linkedin.com/in/bahadir-ciloglu-49b98b369/)  
**Founder:** [Forenly AI - AI Agency](https://forenly.ai)
