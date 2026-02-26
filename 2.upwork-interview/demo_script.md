# 🎬 S2P AI-Native Demo Script (Loom / Live Demo)

> **Duration:** ~3-5 Minutes  
> **Target Audience:** Upwork Client / Suat Ak's Clients  
> **Goal:** Prove the "WOW" factor of GCP + AI in Procurement.

---

## 🕒 [0:00 - 0:30] Introduction
**Screen:** Camera + Forenly.ai Homepage
*   "Hi, this is Bahadir from Forenly AI. Today I’m demonstrating our **End-to-End Source-to-Pay (S2P)** automation pipeline built on Google Cloud Platform."
*   "The goal of this system is to eliminate manual friction in procurement, reducing order-to-pay cycles from hours to minutes."

---

## 🔍 [0:30 - 1:30] Phase 1: AI-Powered Supplier Discovery
**Screen:** FastAPI Dashboard — `Supplier Discovery`
*   "We start with **Supplier Discovery**. Instead of manually searching, we use our FastAPI backend to call the Google Maps Places API."
*   "Here’s the interesting part: We don’t just get names. We pass these results to **Gemini AI (Vertex AI)**. The AI scores each supplier from 0-100 based on their online profile, ratings, and location proximity."
*   "Let’s look at the database..." 
**Switch to:** Database/Terminal `SELECT * FROM suppliers`
*   "As you can see, 'Filtre Coffee Shop' was automatically discovered, scored (Score: 71), and saved to our Cloud SQL instance."

---

## 📄 [1:30 - 2:30] Phase 2: Automated PO & Invoice Intake
**Screen:** FastAPI Service — `PO Creation`
*   "Once we select a supplier, we generate a **Purchase Order** automatically. No manual data entry. Everything from tax calculation to PO number generation is handled by the orchestration layer."
*   "Now, imagine the supplier sends an invoice."
**Screen:** Google Document AI Console (Optional) or `Invoice Processing`
*   "We use **Google Document AI** to extract data from incoming PDFs. We don't just 'OCR' it; we understand the line items, tax details, and IBANs."

---

## 🤖 [2:30 - 3:30] Phase 3: The "Magic" — 3-Way March
**Screen:** AI Matching Engine — `3-Way Match`
*   "This is where most businesses struggle: **3-Way Matching**. We compare the Invoice vs. the PO vs. the Goods Receipt."
*   "We don't use rigid rules. We use **Vertex AI** to find semantic matches. If a supplier bills for '1000 Regular Filters' but the PO said '1000 Coffee Filters', the AI knows they are the same—or flags it if the price is off."
*   "This process alone saves our clients about 30 minutes of manual checking per invoice."

---

## 📊 [3:30 - 4:00] Closing & ROI
**Screen:** ROI Report (roi_report.md) or Looker Studio Mockup
*   "The result? A **97% reduction in processing time**. For a mid-size client, that’s over **$20,000 in monthly labor savings**."
*   "This is GCP-native, scalable, and keeps all data within the client's own cloud perimeter."
*   "I'd love to discuss how we can implement this architecture for your business."

---

## 💡 Technical Tips for the Demo
1.  **Clear Records:** Show an empty table, run the workflow, then show the data appear. This is the most impactful part.
2.  **Zoom In:** Ensure the dashboard text is clearly readable. Zoom the browser to 125%.
3.  **Speed:** Don't wait for Vertex AI responses; have a pre-recorded or "instant" execution result ready if the connection is slow.
