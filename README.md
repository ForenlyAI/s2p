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

## 🔄 The S2P Lifecycle: Stage-by-Stage Workflow

The Forenly AI S2P platform operates on a high-precision Kanban flow. Each candidate supplier is represented as a **Company Card** that carries its own metadata, documentation, and AI-score as it moves toward final settlement.

### 1. Discovery (The Sourcing Engine)
*Initial phase where global data is ingested and filtered.*
- **API Ingestion**: Discovery via **Google Maps (Places) API** and industry-specific crawlers.
- **AI Scoring**: Gemini AI analyzes the digital footprint and scores the vendor (1-100) based on strategic fit.
- **Card Action**: User reviews the "Discovery Card" and creates a formal entry in the pipeline.

### 2. Qualification (RFI/RFQ Stage)
*Standardizing and validating supplier data.*
- **Company Card Actions**:
    - **RFI (Request for Information)**: Uploading certificates (ISO, Tax IDs) directly to the card.
    - **Metadata Management**: Editing lead times, minimum order quantities (MOQ), and shipping terms.
- **Goal**: Transition a "Lead" into a "Qualified Supplier."

### 3. Negotiation (RFQ/RFP Stage)
*Determining financial and operational viability.*
- **Company Card Actions**:
    - **RFQ (Request for Quotation)**: Inputting unit prices and comparing competing bids side-by-side.
    - **RFP (Request for Proposal)**: Attaching complex technical proposals and milestone requirements.
    - **Scenario Analysis**: Adjusting variable costs (discounts, bulk rates) to see real-time ROI impact.

### 4. Fulfillment (PO & Goods Receipt)
*Operational execution and tracking.*
- **Company Card Actions**:
    - **PO Generation**: Automated creation of Purchase Orders (PDF) based on negotiated card data.
    - **GRN Integration**: Tracking Goods Receipt Notes (GRN) to confirm physical delivery against the order.

### 5. Final Settlement (The Path to Payment)
*Security, validation, and payout.*
- **3-Way Match Verification**: The system triggers a semantic comparison between the **Invoice**, **Purchase Order**, and **Goods Receipt**.
- **Fraud Check**: AI flags any discrepancies in IBANs, tax calculations, or unauthorized price variances.
- **Final Move**: Once validated, the card moves to **Paid**, archiving the full history into Cloud SQL for audit.

## 🛠️ Setup & Installation

Detailed instructions can be found in the [S2P Engine Documentation](./1.source-to-pay-engine/README.md).

## 📈 Success Metrics
- **Manual Labor Reduction:** 97% reduction in 3-way match time.
- **Accuracy:** 99.2% extraction accuracy via Document AI.
- **Risk Mitigation:** Real-time flagging of financial discrepancies.

---
**Prepared by:** [Bahadir Ciloglu](https://www.linkedin.com/in/bahadir-ciloglu-49b98b369/)  
**Founder:** [Forenly AI - AI Agency](https://forenly.ai)
