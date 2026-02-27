-- ============================================================
-- S2P Pipeline — PostgreSQL Schema
-- Project: Enterprise Pilot Client Kahve Filtre Tedarik Zinciri
-- Database: Cloud SQL (PostgreSQL 15+)
-- Created: 2026-02-25
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. SUPPLIERS (Tedarikçiler)
-- ============================================================
CREATE TABLE suppliers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    contact_name    VARCHAR(255),
    email           VARCHAR(255),
    phone           VARCHAR(50),
    address         TEXT,
    city            VARCHAR(100),
    country         VARCHAR(100) DEFAULT 'Turkey',
    iban            VARCHAR(34),                     -- IBAN for payment verification
    tax_id          VARCHAR(20),                     -- Vergi Kimlik Numarası
    
    -- Google Maps API data
    google_place_id VARCHAR(255),
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    maps_rating     DECIMAL(2, 1),
    maps_review_count INTEGER,
    website_url     VARCHAR(500),
    
    -- Vertex AI scoring
    ai_score        DECIMAL(5, 2),                   -- 0-100 composite score
    ai_score_price  DECIMAL(5, 2),                   -- Price competitiveness
    ai_score_quality DECIMAL(5, 2),                  -- Quality indicators
    ai_score_location DECIMAL(5, 2),                 -- Proximity score
    ai_analysis     JSONB,                           -- Full AI analysis payload
    
    -- Status
    status          VARCHAR(20) DEFAULT 'discovered' 
                    CHECK (status IN ('discovered', 'qualified', 'approved', 'active', 'suspended', 'blacklisted')),
    approved_by     VARCHAR(255),
    approved_at     TIMESTAMPTZ,
    
    -- Metadata
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    notes           TEXT
);

CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_suppliers_city ON suppliers(city);
CREATE INDEX idx_suppliers_ai_score ON suppliers(ai_score DESC);

-- ============================================================
-- 2. PURCHASE ORDERS (Satın Alma Siparişleri)
-- ============================================================
CREATE TABLE purchase_orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number       VARCHAR(50) UNIQUE NOT NULL,     -- e.g., PO-2026-00001
    supplier_id     UUID NOT NULL REFERENCES suppliers(id),
    
    -- Order details
    description     TEXT,
    currency        VARCHAR(3) DEFAULT 'TRY',
    subtotal        DECIMAL(12, 2) NOT NULL,
    tax_rate        DECIMAL(5, 2) DEFAULT 20.00,     -- KDV oranı
    tax_amount      DECIMAL(12, 2),
    total_amount    DECIMAL(12, 2) NOT NULL,
    
    -- Line items stored as JSONB for flexibility
    line_items      JSONB NOT NULL DEFAULT '[]',
    /*
    Example line_items:
    [
        {
            "item": "Kahve Filtresi - Tip A",
            "quantity": 500,
            "unit_price": 2.50,
            "total": 1250.00
        }
    ]
    */
    
    -- Dates
    order_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    actual_delivery DATE,
    
    -- Status
    status          VARCHAR(20) DEFAULT 'draft'
                    CHECK (status IN ('draft', 'sent', 'acknowledged', 'partially_received', 'received', 'completed', 'cancelled')),
    
    -- Approval
    created_by      VARCHAR(255),
    approved_by     VARCHAR(255),
    approved_at     TIMESTAMPTZ,
    
    -- Metadata
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    notes           TEXT
);

CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_number ON purchase_orders(po_number);
CREATE SEQUENCE po_number_seq START 1;

-- ============================================================
-- 3. GOODS RECEIPTS (Depo Giriş Fişleri)
-- ============================================================
CREATE TABLE goods_receipts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gr_number       VARCHAR(50) UNIQUE NOT NULL,     -- e.g., GR-2026-00001
    po_id           UUID NOT NULL REFERENCES purchase_orders(id),
    supplier_id     UUID NOT NULL REFERENCES suppliers(id),
    
    -- Receipt details
    received_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    received_by     VARCHAR(255),
    
    -- Quantities
    line_items      JSONB NOT NULL DEFAULT '[]',
    /*
    Example:
    [
        {
            "item": "Kahve Filtresi - Tip A",
            "ordered_qty": 500,
            "received_qty": 480,
            "damaged_qty": 5,
            "accepted_qty": 475
        }
    ]
    */
    
    -- Quality check
    quality_check   VARCHAR(20) DEFAULT 'pending'
                    CHECK (quality_check IN ('pending', 'passed', 'failed', 'partial')),
    quality_notes   TEXT,
    
    -- Status
    status          VARCHAR(20) DEFAULT 'received'
                    CHECK (status IN ('received', 'inspecting', 'accepted', 'rejected', 'partial_accept')),
    
    -- Metadata
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    notes           TEXT
);

CREATE INDEX idx_gr_po ON goods_receipts(po_id);
CREATE INDEX idx_gr_supplier ON goods_receipts(supplier_id);
CREATE SEQUENCE gr_number_seq START 1;

-- ============================================================
-- 4. INVOICES (Gelen Faturalar)
-- ============================================================
CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number  VARCHAR(100) NOT NULL,            -- Tedarikçinin fatura numarası
    supplier_id     UUID REFERENCES suppliers(id),
    po_id           UUID REFERENCES purchase_orders(id),
    
    -- Invoice amounts (from Document AI extraction)
    currency        VARCHAR(3) DEFAULT 'TRY',
    subtotal        DECIMAL(12, 2),
    tax_rate        DECIMAL(5, 2),
    tax_amount      DECIMAL(12, 2),
    total_amount    DECIMAL(12, 2) NOT NULL,
    
    -- Extracted data
    invoice_date    DATE,
    due_date        DATE,
    supplier_name_extracted VARCHAR(255),              -- OCR'dan çıkan isim
    iban_extracted  VARCHAR(34),                       -- OCR'dan çıkan IBAN
    
    -- Document AI results
    document_ai_raw JSONB,                            -- Full Document AI response
    extraction_confidence DECIMAL(5, 4),              -- 0.0000 - 1.0000
    
    -- File reference
    gcs_uri         VARCHAR(500),                     -- gs://bucket/path/invoice.pdf
    original_filename VARCHAR(255),
    
    -- Processing status
    status          VARCHAR(20) DEFAULT 'received'
                    CHECK (status IN ('received', 'processing', 'extracted', 'matched', 'disputed', 'approved', 'paid', 'rejected')),
    
    -- Metadata
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    notes           TEXT
);

CREATE INDEX idx_invoices_supplier ON invoices(supplier_id);
CREATE INDEX idx_invoices_po ON invoices(po_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ============================================================
-- 5. THREE-WAY MATCH RESULTS (3-Way Match Sonuçları)
-- ============================================================
CREATE TABLE match_results (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id      UUID NOT NULL REFERENCES invoices(id),
    po_id           UUID NOT NULL REFERENCES purchase_orders(id),
    gr_id           UUID REFERENCES goods_receipts(id),  -- Nullable if no GR yet
    
    -- Match checks
    amount_match    BOOLEAN,                          -- Invoice amount == PO amount?
    amount_variance DECIMAL(12, 2),                   -- Difference (invoice - PO)
    amount_variance_pct DECIMAL(5, 2),                -- Percentage difference
    
    quantity_match  BOOLEAN,                          -- Received qty == Ordered qty?
    quantity_variance JSONB,                          -- Per-item variance details
    
    iban_match      BOOLEAN,                          -- Invoice IBAN == Supplier IBAN?
    iban_invoice    VARCHAR(34),
    iban_on_file    VARCHAR(34),
    
    -- AI Analysis
    ai_verdict      VARCHAR(20) NOT NULL
                    CHECK (ai_verdict IN ('approved', 'review_required', 'rejected', 'fraud_alert')),
    ai_confidence   DECIMAL(5, 4),                    -- 0.0000 - 1.0000
    ai_reasoning    TEXT,                             -- Vertex AI explanation
    ai_risk_score   DECIMAL(5, 2),                    -- 0-100 risk score
    ai_raw_response JSONB,                            -- Full Vertex AI response
    
    -- Flags
    is_fraud_risk   BOOLEAN DEFAULT FALSE,
    fraud_indicators JSONB DEFAULT '[]',
    /*
    Example fraud_indicators:
    [
        {"type": "iban_mismatch", "severity": "high", "detail": "IBAN on invoice differs from registered IBAN"},
        {"type": "amount_over", "severity": "medium", "detail": "Invoice 15% higher than PO"}
    ]
    */
    
    -- Resolution
    resolved_by     VARCHAR(255),
    resolved_at     TIMESTAMPTZ,
    resolution_notes TEXT,
    
    -- Final status
    status          VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending', 'auto_approved', 'manual_review', 'approved', 'rejected')),
    
    -- Metadata
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_match_invoice ON match_results(invoice_id);
CREATE INDEX idx_match_po ON match_results(po_id);
CREATE INDEX idx_match_verdict ON match_results(ai_verdict);
CREATE INDEX idx_match_fraud ON match_results(is_fraud_risk) WHERE is_fraud_risk = TRUE;

-- ============================================================
-- 6. PAYMENTS (Ödeme Kayıtları)
-- ============================================================
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number  VARCHAR(50) UNIQUE NOT NULL,      -- e.g., PAY-2026-00001
    invoice_id      UUID NOT NULL REFERENCES invoices(id),
    supplier_id     UUID NOT NULL REFERENCES suppliers(id),
    match_result_id UUID REFERENCES match_results(id),
    
    -- Payment details
    currency        VARCHAR(3) DEFAULT 'TRY',
    amount          DECIMAL(12, 2) NOT NULL,
    payment_method  VARCHAR(30) DEFAULT 'bank_transfer'
                    CHECK (payment_method IN ('bank_transfer', 'credit_card', 'open_banking', 'craftgate', 'cash')),
    
    -- Bank details
    iban_used       VARCHAR(34),
    bank_reference  VARCHAR(100),
    
    -- Dates
    scheduled_date  DATE,
    executed_date   DATE,
    
    -- Status
    status          VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending', 'scheduled', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    
    -- Gateway response (Craftgate / Open Banking)
    gateway_response JSONB,
    
    -- Metadata
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    notes           TEXT
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_supplier ON payments(supplier_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE SEQUENCE payment_number_seq START 1;

-- ============================================================
-- 7. AUDIT LOG (Denetim İzi)
-- ============================================================
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type     VARCHAR(50) NOT NULL,             -- 'supplier', 'po', 'invoice', etc.
    entity_id       UUID NOT NULL,
    action          VARCHAR(20) NOT NULL,             -- 'create', 'update', 'delete', 'approve', 'match'
    performed_by    VARCHAR(255),
    old_values      JSONB,
    new_values      JSONB,
    ip_address      INET,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_date ON audit_log(created_at);

-- ============================================================
-- 8. HELPER VIEWS
-- ============================================================

-- Dashboard view: Pending matches needing review
CREATE VIEW v_pending_reviews AS
SELECT 
    mr.id AS match_id,
    i.invoice_number,
    s.name AS supplier_name,
    po.po_number,
    i.total_amount AS invoice_amount,
    po.total_amount AS po_amount,
    mr.amount_variance,
    mr.ai_verdict,
    mr.ai_risk_score,
    mr.is_fraud_risk,
    mr.created_at
FROM match_results mr
JOIN invoices i ON mr.invoice_id = i.id
JOIN purchase_orders po ON mr.po_id = po.id
JOIN suppliers s ON i.supplier_id = s.id
WHERE mr.status IN ('pending', 'manual_review')
ORDER BY mr.ai_risk_score DESC;

-- Dashboard view: Monthly spend summary
CREATE VIEW v_monthly_spend AS
SELECT 
    DATE_TRUNC('month', p.executed_date) AS month,
    s.name AS supplier_name,
    COUNT(p.id) AS payment_count,
    SUM(p.amount) AS total_spent,
    AVG(p.amount) AS avg_payment
FROM payments p
JOIN suppliers s ON p.supplier_id = s.id
WHERE p.status = 'completed'
GROUP BY DATE_TRUNC('month', p.executed_date), s.name
ORDER BY month DESC, total_spent DESC;

-- Dashboard view: Supplier performance
CREATE VIEW v_supplier_performance AS
SELECT 
    s.id,
    s.name,
    s.ai_score,
    s.status,
    COUNT(DISTINCT po.id) AS total_orders,
    COUNT(DISTINCT i.id) AS total_invoices,
    COALESCE(SUM(p.amount), 0) AS total_paid,
    COUNT(CASE WHEN mr.is_fraud_risk THEN 1 END) AS fraud_flags,
    AVG(mr.ai_risk_score) AS avg_risk_score
FROM suppliers s
LEFT JOIN purchase_orders po ON s.id = po.supplier_id
LEFT JOIN invoices i ON s.id = i.supplier_id
LEFT JOIN payments p ON s.id = p.supplier_id AND p.status = 'completed'
LEFT JOIN match_results mr ON i.id = mr.invoice_id
GROUP BY s.id, s.name, s.ai_score, s.status
ORDER BY s.ai_score DESC NULLS LAST;

-- ============================================================
-- 9. TRIGGER: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_po_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_gr_updated_at
    BEFORE UPDATE ON goods_receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_match_updated_at
    BEFORE UPDATE ON match_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- DONE
-- ============================================================
-- Total Tables: 7 (suppliers, purchase_orders, goods_receipts, invoices, match_results, payments, audit_log)
-- Total Views: 3 (v_pending_reviews, v_monthly_spend, v_supplier_performance)
-- Total Indexes: 16
-- Total Sequences: 3
-- Total Triggers: 6
