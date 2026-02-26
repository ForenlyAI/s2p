import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './assets/logo.png';

const PHASES = [
    { id: 1, title: 'Strategic Sourcing', subtitle: 'AI Discovery', icon: '🔍', description: 'Leverage swarm intelligence to discover and scout global suppliers based on your specific product requirements.' },
    { id: 2, title: 'Supplier Qualification', subtitle: 'Qualify & Intent', icon: '📊', description: 'Analyze supplier reliability, collect necessary documentation, and verify technical compliance automatically.' },
    { id: 3, title: 'P2P Orchestration', subtitle: 'Order Generation', icon: '📦', description: 'Convert intent into formal Purchase Orders with AI-generated line items and automated approval workflows.' },
    { id: 4, title: 'Accounts Payable', subtitle: '3-Way Match', icon: '💰', description: 'Autonomous verification of Invoices, POs, and Shipments using multi-modal AI for perfect financial auditing.' },
    { id: 5, title: 'Payment Execution', subtitle: 'Settlement', icon: '💸', description: 'Trigger secure financial settlement and record the transaction in the immutable supplier ledger.' }
];

function App() {
    const [activePhase, setActivePhase] = useState(() => {
        const saved = localStorage.getItem('s2p_active_phase');
        return saved ? parseInt(saved, 10) : 1;
    });
    const [searchQuery, setSearchQuery] = useState(''); // Empty initially for demo
    const [suppliers, setSuppliers] = useState([]); // Empty initially
    const [toast, setToast] = useState(null); // { message, type }
    const [poInputValue, setPoInputValue] = useState('');
    const [byokKey, setByokKey] = useState('');
    const [byokTarget, setByokTarget] = useState(null); // { id, name }

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };
    const [journeyData, setJourneyData] = useState({
        phase2: [], // Firms in RFI/RFQ/RFP
        phase3: [], // Firms with PO Intent
        phase4: [], // Firms with Issued PO
        phase5: []  // Firms Ready to Pay
    });
    const [stats, setStats] = useState({ total: 0, sources: {} });
    const [connStates, setConnStates] = useState({
        mcp: { active: true, key: 'INTERNAL' },
        maps: { active: false, key: null, testing: false },
        apollo: { active: false, key: null, testing: false },
        clearbit: { active: false, key: null, testing: false },
        opencorporates: { active: false, key: null, testing: false },
        crunchbase: { active: false, key: null, testing: false },
        dnb: { active: false, key: null, testing: false },
        hunter: { active: false, key: null, testing: false },
        openai: { active: false, key: null, testing: false }
    });

    useEffect(() => {
        // Fetch only stats on mount, keep suppliers empty for discovery demo
        fetchStats();
    }, []);

    useEffect(() => {
        localStorage.setItem('s2p_active_phase', activePhase);
    }, [activePhase]);

    const fetchStats = async () => {
        try {
            const apiBase = 'http://localhost:8000';
            const statRes = await fetch(`${apiBase}/stats`);
            const statData = await statRes.json();
            setStats(statData);
        } catch (e) {
            console.error("Stats fetch failed", e);
        }
    };

    const fetchData = async () => {
        try {
            const apiBase = 'http://localhost:8000';
            const [supRes, statRes] = await Promise.all([
                fetch(`${apiBase}/suppliers`),
                fetch(`${apiBase}/stats`)
            ]);
            const supData = await supRes.json();
            const statData = await statRes.json();

            console.log("Suppliers from backend:", supData);
            setSuppliers(supData);
            setStats(statData);

            // Reconstruct supplierStates from DB fields
            const states = {};
            supData.forEach(s => {
                states[s.id] = {
                    currentPhase: s.current_phase || 1,
                    rfi: s.rfi?.active || false,
                    rfi_docs: s.rfi?.docs || [],
                    rfq: s.rfq?.active || false,
                    rfq_docs: s.rfq?.docs || [],
                    rfp: s.rfp?.active || false,
                    rfp_docs: s.rfp?.docs || [],
                    qualified: s.qualified?.active || false,
                    poCreated: s.po_intent?.poCreated || false,
                    poFile: s.po_intent?.poFile || "",
                    poItems: s.po_intent?.poItems || "",
                    invoiceReceived: s.ap_status?.invoiceReceived || false,
                    shipmentVerified: s.ap_status?.shipmentVerified || false,
                    matchingRun: s.ap_status?.matchingRun || false,
                    matchScore: s.ap_status?.matchScore || 0,
                    matchFile: s.ap_status?.matchFile || "",
                    matchReport: s.ap_status?.matchReport || "",
                    managerApproved: s.ap_status?.managerApproved || false,
                    invoice: s.invoice || { active: false, docs: [] },
                    grn: s.grn || { active: false, docs: [] }
                };
            });
            setSupplierStates(prev => ({ ...prev, ...states }));
        } catch (e) {
            console.error("Backend offline", e);
        }
    };

    const persistState = async (supId, newState) => {
        try {
            // Map frontend state keys to backend DB JSON structure if needed
            // But we can also just send the changed keys and let backend handle it
            await fetch(`http://localhost:8000/suppliers/${supId}/state`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newState)
            });
        } catch (e) {
            console.error("Persist failed", e);
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            const query = document.getElementById('discovery-search').value || 'Global Paper Cup Manufacturers';
            setSearchQuery(query);

            // Simulate AI Search Dynamics for video
            setSuppliers([]); // Clear current cards to show activity
            showToast(`AI agent scouring 40+ databases for "${query}"...`, 'info');

            setTimeout(() => {
                fetchData();
                showToast(`Found matches for "${query}" via MCP Protocol.`, 'success');
            }, 1800);
        }
    };

    const handleToggle = async (id, name) => {
        if (connStates[id].active) {
            setConnStates(prev => ({ ...prev, [id]: { ...prev[id], active: false, key: null } }));
            return;
        }

        setByokTarget({ id, name });
        setModalData({ supplier: { name: 'INTERNAL SYSTEM' }, type: 'byok_connect' });
    };

    const submitBYOK = () => {
        if (!byokKey) return;
        const { id, name } = byokTarget;

        setModalData(null);
        setConnStates(prev => ({ ...prev, [id]: { ...prev[id], testing: true } }));

        showToast(`Connecting to ${name}...`, 'info');

        setTimeout(() => {
            setConnStates(prev => ({
                ...prev,
                [id]: { active: true, key: byokKey.substring(0, 6) + '...', testing: false }
            }));
            showToast(`${name} Connection Verified.`, 'success');
            setByokKey('');
            setByokTarget(null);
        }, 1500);
    };

    // Unified State for Supplier Progress
    const [supplierStates, setSupplierStates] = useState({});
    const [modalData, setModalData] = useState(null); // { supplier, type }

    const toggleCheck = (supId, type) => {
        const active = !supplierStates[supId]?.[type];
        setSupplierStates(prev => ({
            ...prev,
            [supId]: {
                ...prev[supId],
                [type]: active
            }
        }));
        persistState(supId, { [type]: { active: active, docs: active ? [`${type.toUpperCase()}_v1.pdf`] : [] } });
    };

    const openUploadModal = (supId, type) => {
        const supplier = suppliers.find(s => s.id === supId);
        setModalData({ supplier, type });
    };

    const openHistoryModal = (supId) => {
        const supplier = suppliers.find(s => s.id === supId);
        setModalData({ supplier, type: 'history' });
    };

    const handleUpload = (supId, type, files) => {
        const newState = {
            [type]: { active: true, docs: files }
        };

        setSupplierStates(prev => ({
            ...prev,
            [supId]: {
                ...prev[supId],
                ...newState
            }
        }));
        persistState(supId, newState);
        showToast(`${type.toUpperCase()} document attached successfully.`, 'success');
        setModalData(null);
    };

    const moveSupplier = (supplier, direction) => {
        const currentPhase = supplierStates[supplier.id]?.currentPhase || 1;
        const nextPhase = direction === 'next' ? currentPhase + 1 : currentPhase - 1;

        if (nextPhase < 1 || nextPhase > 5) return;

        setSupplierStates(prev => ({
            ...prev,
            [supplier.id]: {
                ...prev[supplier.id],
                currentPhase: nextPhase
            }
        }));

        persistState(supplier.id, { current_phase: nextPhase });
        setActivePhase(nextPhase);
        showToast(`${supplier.name} → Phase ${nextPhase}`, 'info');
    };

    // Journey State Transitions (legacy refs updated to new system)
    const moveToPhase2 = (supplier, type) => {
        toggleRequest(supplier.id, type.toLowerCase());
        moveSupplier({ ...supplier, currentPhase: 1 }, 'next');
    };

    const handleQualify = (id, field) => {
        const active = !supplierStates[id]?.[field];
        setSupplierStates(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: active
            }
        }));
        // field is either 'qualified' or 'poCreated'
        if (field === 'qualified') {
            persistState(id, { qualified: { active: active } });
        } else if (field === 'poCreated') {
            persistState(id, { po_intent: { poCreated: active } });
        }
    };

    const moveToPhase3 = (supplier) => {
        moveSupplier({ ...supplier }, 'next');
    };

    const createPO = (supplier) => {
        setModalData({ supplier, type: 'po_create' });
    };

    const submitPO = () => {
        if (!poInputValue.trim()) return;
        const supplier = modalData.supplier;
        const item = poInputValue;

        setSupplierStates(prev => ({
            ...prev,
            [supplier.id]: {
                ...prev[supplier.id],
                poCreated: true,
                poItems: item,
                poFile: `PO_${supplier.name.replace(/\s/g, '_')}_${Date.now()}.pdf`
            }
        }));
        persistState(supplier.id, {
            po_intent: {
                poCreated: true,
                poItems: item,
                poFile: `PO_${supplier.name.replace(/\s/g, '_')}_${Date.now()}.pdf`
            }
        });
        showToast(`Purchase Order created for ${item}`, 'success');
        setModalData(null);
        setPoInputValue('');
    };

    const deletePO = (supId) => {
        setSupplierStates(prev => ({
            ...prev,
            [supId]: { ...prev[supId], poCreated: false, poApproved: false, poItems: null, poFile: null }
        }));
        persistState(supId, { po_intent: { poCreated: false, poApproved: false } });
        showToast('Purchase Order removed.', 'info');
    };

    const togglePOApproval = (supId) => {
        const active = !supplierStates[supId]?.poApproved;
        setSupplierStates(prev => ({
            ...prev,
            [supId]: { ...prev[supId], poApproved: active }
        }));
        persistState(supId, { po_intent: { poApproved: active } });
    };

    const handleAPCheck = (id, field) => {
        const newValue = !supplierStates[id]?.[field];
        const currentData = {
            invoiceReceived: supplierStates[id]?.invoiceReceived || false,
            shipmentVerified: supplierStates[id]?.shipmentVerified || false,
            [field]: newValue
        };

        setSupplierStates(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                ...currentData,
                matchingRun: false, // Reset match if data changes
                managerApproved: false
            }
        }));
        persistState(id, { ap_status: { ...currentData, matchingRun: false, managerApproved: false } });
    };

    const runThreeWayMatch = (id) => {
        if (supplierStates[id]?.matchingProcessing) return;

        setSupplierStates(prev => ({
            ...prev,
            [id]: { ...prev[id], matchingProcessing: true }
        }));

        showToast('AI Analyzing documents...', 'info');
        setTimeout(() => {
            const reportFile = `Match_Report_${id}_${Date.now()}.pdf`;
            const reportData = {
                matchingRun: true,
                matchingProcessing: false,
                matchScore: 98,
                matchFile: reportFile,
                matchReport: `AI Analysis Complete: PO, Invoice, and GRN are 98% consistent. All line items, quantities, and prices match perfectly.`
            };

            setSupplierStates(prev => ({
                ...prev,
                [id]: {
                    ...prev[id],
                    ...reportData
                }
            }));

            // Sync with backend ap_status field
            const apData = {
                invoiceReceived: supplierStates[id]?.invoiceReceived || false,
                shipmentVerified: supplierStates[id]?.shipmentVerified || false,
                managerApproved: supplierStates[id]?.managerApproved || false,
                ...reportData
            };
            persistState(id, { ap_status: apData });

            showToast('3-Way Match Analysis Complete!', 'success');
        }, 1500);
    };

    const handleManagerApproval = (id) => {
        const active = !supplierStates[id]?.managerApproved;
        setSupplierStates(prev => ({
            ...prev,
            [id]: { ...prev[id], managerApproved: active }
        }));
        persistState(id, { ap_status: { ...supplierStates[id], managerApproved: active } });
    };

    const executePayment = (supplier) => {
        setJourneyData(prev => ({
            ...prev,
            phase5: [...prev.phase5, { ...supplier, paymentDate: new Date().toLocaleDateString() }]
        }));
        showToast(`Payment scheduled for ${supplier.name}`, 'success');
        setActivePhase(5);
    };

    return (
        <div className="dashboard-container">


            <header>
                <div className="header-content">
                    <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={logo} alt="Forenly AI Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h1 style={{ fontSize: '1.4rem', margin: 0, lineHeight: 1 }}>Forenly AI</h1>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>S2P AI ORCHESTRATOR</span>
                        </div>
                    </div>

                    <div className="stepper">
                        {PHASES.map(p => (
                            <div
                                key={p.id}
                                className={`step-pill ${activePhase === p.id ? 'active' : ''} ${activePhase > p.id ? 'completed' : ''}`}
                                onClick={() => setActivePhase(p.id)}
                            >
                                <div className="step-num">{activePhase > p.id ? '✓' : p.id}</div>
                                {p.title}
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            <main className="main-layout">
                <aside className="sidebar">
                    <div className="card connections-card">
                        <div className="card-header">
                            <h3>Integration Hub (BYOK)</h3>
                            <span className="live-indicator"></span>
                        </div>
                        <div className="connections-list">
                            {Object.keys(connStates).map(id => {
                                const labels = {
                                    mcp: 'MCP Protocol',
                                    maps: 'Google Maps API',
                                    apollo: 'Apollo.io',
                                    clearbit: 'Clearbit',
                                    opencorporates: 'OpenCorporates',
                                    crunchbase: 'Crunchbase',
                                    dnb: 'Dun & Bradstreet',
                                    hunter: 'Hunter.io',
                                    openai: 'OpenAI (GPT-4o)'
                                };
                                return (
                                    <div className="conn-item" key={id}>
                                        <span className={`conn-status ${connStates[id].active ? 'active' : connStates[id].testing ? 'testing' : 'inactive'}`}></span>
                                        <div className="conn-info">
                                            <div className="conn-name">{labels[id]}</div>
                                            <div className="conn-meta">{connStates[id].testing ? 'VERIFYING...' : connStates[id].key || 'API TOKEN REQUIRED'}</div>
                                        </div>
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={connStates[id].active} onChange={() => handleToggle(id, labels[id])} />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ padding: '1rem', background: '#f8fafc', borderTop: '1px solid var(--border)', fontSize: '0.7rem', color: '#64748b' }}>
                            <strong>Mapping:</strong> API Data → <strong>S2P-Demo Unified DB</strong> <br />
                            Status: <span style={{ color: '#10b981' }}>Persistent Storage Active</span>
                        </div>
                    </div>

                </aside>

                <div className="phase-container">
                    {activePhase === 1 && (
                        <div className="search-bar-outer" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem', marginTop: '-10px' }}>
                            <div className="search-bar-container" style={{
                                width: '100%',
                                maxWidth: '650px',
                                height: '70px',
                                padding: '8px',
                                boxShadow: '0 15px 35px rgba(79, 70, 229, 0.1)'
                            }}>
                                <input
                                    type="text"
                                    id="discovery-search"
                                    placeholder="Search Product (e.g. Industrial Valves)..."
                                    defaultValue={searchQuery}
                                    onKeyDown={handleSearch}
                                    style={{ fontSize: '1.1rem', paddingLeft: '24px' }}
                                />
                                <button
                                    className="search-confirm-btn"
                                    onClick={handleSearch}
                                    style={{
                                        padding: '0 40px',
                                        fontSize: '1rem',
                                        height: '100%',
                                        borderRadius: '50px',
                                        minWidth: '180px'
                                    }}
                                >
                                    🔍 Discover
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="phase-header" style={{ paddingTop: '0.5rem', paddingBottom: '1.5rem' }}>
                        <div className="phase-title">
                            <h2 style={{ marginBottom: '4px' }}>{PHASES[activePhase - 1].icon} {PHASES[activePhase - 1].title}</h2>
                            <p style={{ color: 'var(--text-slate)', fontSize: '0.9rem', maxWidth: '600px', fontWeight: 600 }}>
                                {PHASES[activePhase - 1].description}
                            </p>
                        </div>
                        <div className="phase-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                                Phase {activePhase} of 5
                            </span>
                        </div>
                    </div>

                    {/* Phase 1: Strategic Sourcing */}
                    {activePhase === 1 && (
                        <div className="sourcing-view grid-view">
                            {suppliers.filter(s => (supplierStates[s.id]?.currentPhase || 1) === 1).slice(0, 12).map((s, i) => {
                                // First 5 firms mockup: auto-check RFI if not set
                                const isMockup = i < 5;
                                const hasDocs = type => !!supplierStates[s.id]?.[`${type.toLowerCase()}_docs`];

                                return (
                                    <div className={`supplier-card ${isMockup ? 'mockup-style' : ''}`} key={s.id || i}>
                                        <div className="card-nav">
                                            <span></span>
                                            <button className="nav-arrow" onClick={() => moveSupplier({ ...s, currentPhase: 1 }, 'next')}>→</button>
                                        </div>
                                        <div className="ai-badge">🎯 {Math.round(s.ai_score)}</div>
                                        <div className="supplier-name" style={{ fontWeight: 800 }}>{s.name}</div>
                                        <p style={{ fontSize: '0.7rem', color: '#64748b' }}>📍 {s.city}</p>
                                        <div className="request-boxes" style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                                            {['RFI', 'RFQ', 'RFP'].map(type => (
                                                <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <label className="check-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={!!supplierStates[s.id]?.[type.toLowerCase()]}
                                                            onChange={() => toggleCheck(s.id, type.toLowerCase())}
                                                        />
                                                        <span
                                                            className="doc-label-link"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                openUploadModal(s.id, type.toLowerCase());
                                                            }}
                                                            style={{ cursor: 'pointer', fontWeight: 700 }}
                                                        >
                                                            {type}
                                                        </span>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Phase 2: Supplier Qualification */}
                    {activePhase === 2 && (
                        <div className="grid-view">
                            {suppliers.filter(s => supplierStates[s.id]?.currentPhase === 2).length === 0 ?
                                <p className="empty-msg">No suppliers in qualification. Click → on Phase 1 cards.</p> :
                                suppliers.filter(s => supplierStates[s.id]?.currentPhase === 2).map((s) => (
                                    <div className="supplier-card" key={s.id}>
                                        <div className="card-nav">
                                            <button className="nav-arrow" onClick={() => moveSupplier({ ...s, currentPhase: 2 }, 'prev')}>←</button>
                                            <button className="nav-arrow" onClick={() => openHistoryModal(s.id)}>📜</button>
                                            <button className="nav-arrow" onClick={() => moveSupplier({ ...s, currentPhase: 2 }, 'next')}>→</button>
                                        </div>
                                        <div className="supplier-name" style={{ fontWeight: 800 }}>{s.name}</div>
                                        <div className="sent-requests" style={{ display: 'flex', gap: '5px', margin: '10px 0' }}>
                                            {['rfi', 'rfq', 'rfp'].map(type => (
                                                supplierStates[s.id]?.[type] && <span key={type} className="mode-tag">{type.toUpperCase()} SENT</span>
                                            ))}
                                        </div>
                                        <div className="check-list">
                                            <label><input type="checkbox" checked={!!supplierStates[s.id]?.qualified} onChange={() => handleQualify(s.id, 'qualified')} /> Qualify Supplier</label>
                                            <br />
                                            <label><input type="checkbox" checked={!!supplierStates[s.id]?.poCreated} onChange={() => handleQualify(s.id, 'poCreated')} /> PO Intent (Move to P2P)</label>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}

                    {/* Phase 3: P2P Orchestration */}
                    {activePhase === 3 && (
                        <div className="grid-view">
                            {suppliers.filter(s => supplierStates[s.id]?.currentPhase === 3).length === 0 ?
                                <p className="empty-msg">No active PO processes. Move a qualified supplier from Phase 2.</p> :
                                suppliers.filter(s => supplierStates[s.id]?.currentPhase === 3).map((s) => (
                                    <div className="supplier-card" key={s.id}>
                                        <div className="card-nav">
                                            <button className="nav-arrow" onClick={() => moveSupplier({ ...s, currentPhase: 3 }, 'prev')}>←</button>
                                            <button className="nav-arrow" onClick={() => openHistoryModal(s.id)}>📜</button>
                                            <button className="nav-arrow" onClick={() => moveSupplier({ ...s, currentPhase: 3 }, 'next')}>→</button>
                                        </div>
                                        <div className="supplier-name" style={{ fontWeight: 800 }}>{s.name}</div>
                                        <div className="carry-over" style={{ fontSize: '0.7rem', color: '#64748b', margin: '10px 0' }}>
                                            {supplierStates[s.id]?.qualified && <span style={{ color: '#10b981' }}>✓ Qualified</span>}
                                        </div>

                                        <div className="request-boxes" style={{ marginTop: '1.2rem' }}>
                                            {!supplierStates[s.id]?.poCreated ? (
                                                <button className="po-btn" onClick={() => createPO(s)} style={{ width: '100%', margin: 0 }}>
                                                    + Create Purchase Order
                                                </button>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--primary-soft)', padding: '12px', borderRadius: '12px' }}>
                                                    <label className="check-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={!!supplierStates[s.id]?.poApproved}
                                                            onChange={() => togglePOApproval(s.id)}
                                                        />
                                                        <span style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--primary)' }}>PO VERIFIED & APPROVED</span>
                                                    </label>
                                                    {supplierStates[s.id]?.poCreated && (
                                                        <div className="po-details-attached" style={{ paddingLeft: '28px' }}>
                                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-slate)' }}>{supplierStates[s.id]?.poItems}</div>
                                                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span>📄 {supplierStates[s.id]?.poFile}</span>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); deletePO(s.id); }}
                                                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 800, cursor: 'pointer', padding: '0 5px', fontSize: '1.2rem', lineHeight: 1 }}
                                                                    title="Delete PO"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}

                    {/* Phase 4: Accounts Payable */}
                    {activePhase === 4 && (
                        <div className="grid-view">
                            {suppliers.filter(s => supplierStates[s.id]?.currentPhase === 4).length === 0 ?
                                <p className="empty-msg">No pending payments. Complete PO in Phase 3.</p> :
                                suppliers.filter(s => supplierStates[s.id]?.currentPhase === 4).map((s) => (
                                    <div className="supplier-card" key={s.id}>
                                        <div className="card-nav">
                                            <button className="nav-arrow" onClick={() => moveSupplier({ ...s, currentPhase: 4 }, 'prev')}>←</button>
                                            <button className="nav-arrow" onClick={() => openHistoryModal(s.id)}>📜</button>
                                            <button className="nav-arrow" onClick={() => moveSupplier({ ...s, currentPhase: 4 }, 'next')}>→</button>
                                        </div>
                                        <div className="supplier-name" style={{ fontWeight: 800 }}>{s.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', margin: '5px 0' }}>Item: {supplierStates[s.id]?.poItems}</div>
                                        <div className="ap-checks" style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)', background: 'var(--primary-soft)', padding: '4px 8px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                                                PO ATTACHED: {supplierStates[s.id]?.poFile}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!supplierStates[s.id]?.invoiceReceived}
                                                        onChange={() => handleAPCheck(s.id, 'invoiceReceived')}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <span
                                                        onClick={() => openUploadModal(s.id, 'invoice')}
                                                        style={{ textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                                                    >
                                                        Invoice Received
                                                    </span>
                                                </div>
                                                {supplierStates[s.id]?.invoice?.active && <span style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 800 }}>📄 Attached</span>}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!supplierStates[s.id]?.shipmentVerified}
                                                        onChange={() => handleAPCheck(s.id, 'shipmentVerified')}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <span
                                                        onClick={() => openUploadModal(s.id, 'grn')}
                                                        style={{ textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                                                    >
                                                        Shipment Verified (GRN)
                                                    </span>
                                                </div>
                                                {supplierStates[s.id]?.grn?.active && <span style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 800 }}>📄 Attached</span>}
                                            </div>

                                            {supplierStates[s.id]?.matchingRun && (
                                                <div style={{ padding: '8px 0', borderTop: '1px dashed var(--border)', marginTop: '4px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={!!supplierStates[s.id]?.managerApproved}
                                                                onChange={() => handleManagerApproval(s.id)}
                                                                style={{ cursor: 'pointer' }}
                                                            />
                                                            <span
                                                                onClick={() => setModalData({ supplier: s, type: 'report_view' })}
                                                                style={{ textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}
                                                            >
                                                                AI Match Report
                                                            </span>
                                                        </div>
                                                        <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#10b981' }}>{supplierStates[s.id]?.matchScore}% MATCH</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px', paddingLeft: '24px' }}>
                                                        📄 {supplierStates[s.id]?.matchFile}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {supplierStates[s.id]?.invoiceReceived && supplierStates[s.id]?.shipmentVerified && !supplierStates[s.id]?.matchingRun && (
                                            <div className="match-section" style={{ marginTop: '15px' }}>
                                                <button
                                                    className="po-btn"
                                                    style={{ background: 'var(--primary)', margin: 0, padding: '10px', fontSize: '0.75rem', opacity: supplierStates[s.id]?.matchingProcessing ? 0.7 : 1 }}
                                                    onClick={() => runThreeWayMatch(s.id)}
                                                    disabled={supplierStates[s.id]?.matchingProcessing}
                                                >
                                                    {supplierStates[s.id]?.matchingProcessing ? '✨ Analyzing...' : '✨ Run AI 3-Way Match Analysis'}
                                                </button>
                                            </div>
                                        )}


                                    </div>
                                ))
                            }
                        </div>
                    )}

                    {/* Phase 5: Payment Execution */}
                    {activePhase === 5 && (
                        <div className="grid-view">
                            {suppliers.filter(s => supplierStates[s.id]?.currentPhase === 5).map((s) => (
                                <div className="supplier-card settled" key={s.id} style={{
                                    border: '2px solid #10b981',
                                    background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)',
                                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.1)'
                                }}>
                                    <div className="card-nav">
                                        <button className="nav-arrow" onClick={() => moveSupplier({ ...s, currentPhase: 5 }, 'prev')}>←</button>
                                        <button className="nav-arrow" onClick={() => openHistoryModal(s.id)}>📜</button>
                                        <div className="ai-badge" style={{ fontSize: '0.6rem', background: '#10b981', color: 'white' }}>APPROVED BY AI</div>
                                    </div>
                                    <div className="supplier-name" style={{ fontWeight: 800, marginTop: '10px' }}>{s.name}</div>
                                    <div style={{ margin: '15px 0' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px' }}>TRANSACTION SETTLED</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#065f46' }}>PAYMENT RELEASED</div>
                                    </div>
                                    <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46' }}>Item: {supplierStates[s.id]?.poItems}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px' }}>Reference: {supplierStates[s.id]?.poFile}</div>
                                    </div>
                                    <div className="success-badge" style={{ color: '#10b981', fontWeight: 800, marginTop: '15px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>💰</span> Funds Transferred
                                    </div>
                                </div>
                            ))}
                            <button className="start-btn" style={{ gridColumn: '1/-1' }} onClick={() => setActivePhase(1)}>New Cycle</button>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal Switcher */}
            {modalData && (
                <div className="modal-overlay" onClick={() => { setModalData(null); setPoInputValue(''); }}>
                    <div className={`modal-card ${modalData.type === 'history' ? 'history-wide' : ''}`} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{
                                modalData.type === 'history' ? 'SUPPLIER AUDIT TRAIL' :
                                    modalData.type === 'po_create' ? 'CREATE PURCHASE ORDER' :
                                        modalData.type === 'report_view' ? 'AI 3-WAY MATCH ANALYSIS REPORT' :
                                            modalData.type === 'byok_connect' ? 'SERVICE INTEGRATION' :
                                                `${modalData.type.toUpperCase()} DOCUMENT UPLOAD`
                            }</h3>
                            <button className="close-btn" onClick={() => { setModalData(null); setPoInputValue(''); }}>×</button>
                        </div>
                        <div className="modal-body">
                            {modalData.type !== 'byok_connect' && (
                                <div className="supplier-info-mini" style={{ marginBottom: '1.5rem', background: 'var(--primary-soft)', padding: '10px', borderRadius: '8px' }}>
                                    <strong>Supplier:</strong> {modalData.supplier.name} {modalData.type === 'report_view' && <span className="ai-badge">AI ANALYZED</span>}
                                </div>
                            )}

                            {modalData.type === 'report_view' ? (
                                <div className="report-content" style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>MATCHING VERIFICATION RESULTS</div>
                                        <div style={{ color: '#10b981', fontWeight: 900 }}>SCORE: {supplierStates[modalData.supplier.id]?.matchScore}%</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                            <span>Purchase Order Comparison:</span>
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>✓ MATCHED</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                            <span>Invoice Line Items Control:</span>
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>✓ MATCHED</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                            <span>Shipment (GRN) Quantity Verify:</span>
                                            <span style={{ color: '#10b981', fontWeight: 700 }}>✓ MATCHED</span>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #cbd5e1', fontSize: '0.75rem', color: '#64748b', lineHeight: '1.5' }}>
                                        <strong>AI Executive Summary:</strong><br />
                                        {supplierStates[modalData.supplier.id]?.matchReport}
                                    </div>
                                </div>
                            ) : modalData.type === 'po_create' ? (
                                <div className="po-input-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <label style={{ fontWeight: 700, fontSize: '0.85rem' }}>Enter Order Item and Quantity:</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 1000 Units Paper Cups"
                                        value={poInputValue}
                                        onChange={(e) => setPoInputValue(e.target.value)}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '2px solid var(--primary-soft)',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && submitPO()}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        After this process, a digital PO document will be automatically generated and attached to the supplier card.
                                    </p>
                                </div>
                            ) : modalData.type === 'history' ? (
                                <div className="history-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Phase 1 History */}
                                    <div className="history-phase">
                                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '2px solid var(--primary-soft)', paddingBottom: '4px', marginBottom: '10px' }}>
                                            PHASE 1: Strategic Sourcing
                                        </div>
                                        <div className="history-entries">
                                            {['rfi', 'rfq', 'rfp'].map(key => (
                                                <div key={key} className="history-entry-card">
                                                    <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{key} Request</span>
                                                    <span style={{ color: supplierStates[modalData.supplier.id]?.[key] ? '#10b981' : '#94a3b8', fontWeight: 700 }}>
                                                        {supplierStates[modalData.supplier.id]?.[key] ? '✅ Completed' : '❌ Pending'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Phase 2 History (Conditional) */}
                                    {(supplierStates[modalData.supplier.id]?.currentPhase >= 2) && (
                                        <div className="history-phase">
                                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '2px solid var(--primary-soft)', paddingBottom: '4px', marginBottom: '10px' }}>
                                                PHASE 2: Supplier Qualification
                                            </div>
                                            <div className="history-entries">
                                                <div className="history-entry-card">
                                                    <span style={{ fontWeight: 700 }}>Qualification Status</span>
                                                    <span style={{ color: supplierStates[modalData.supplier.id]?.qualified ? '#10b981' : '#94a3b8', fontWeight: 700 }}>
                                                        {supplierStates[modalData.supplier.id]?.qualified ? '✅ Qualified' : '❌ Not Qualified'}
                                                    </span>
                                                </div>
                                                <div className="history-entry-card">
                                                    <span style={{ fontWeight: 700 }}>Purchase Intent (Move to P2P)</span>
                                                    <span style={{ color: supplierStates[modalData.supplier.id]?.poCreated ? '#10b981' : '#94a3b8', fontWeight: 700 }}>
                                                        {supplierStates[modalData.supplier.id]?.poCreated ? '✅ Confirmed' : '❌ Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Phase 3 History (Conditional) */}
                                    {(supplierStates[modalData.supplier.id]?.currentPhase >= 3 && supplierStates[modalData.supplier.id]?.poCreated) && (
                                        <div className="history-phase">
                                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '2px solid var(--primary-soft)', paddingBottom: '4px', marginBottom: '10px' }}>
                                                PHASE 3: P2P Orchestration
                                            </div>
                                            <div className="history-entries">
                                                <div className="history-entry-card">
                                                    <span style={{ fontWeight: 700 }}>Purchase Order Item</span>
                                                    <span style={{ color: '#10b981', fontWeight: 800 }}>{supplierStates[modalData.supplier.id]?.poItems}</span>
                                                </div>
                                                <div className="history-entry-card" style={{ background: 'var(--primary-soft)', borderColor: 'var(--primary)' }}>
                                                    <span style={{ fontWeight: 700 }}>Attached PO File</span>
                                                    <span style={{ fontWeight: 800 }}>📄 {supplierStates[modalData.supplier.id]?.poFile || 'PO_Generated.pdf'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Phase 4 History (Conditional) */}
                                    {(supplierStates[modalData.supplier.id]?.currentPhase >= 4) && (
                                        <div className="history-phase">
                                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '2px solid var(--primary-soft)', paddingBottom: '4px', marginBottom: '10px' }}>
                                                PHASE 4: Accounts Payable
                                            </div>
                                            <div className="history-entries">
                                                <div className="history-entry-card">
                                                    <span style={{ fontWeight: 700 }}>Invoice Verification</span>
                                                    <span style={{ color: supplierStates[modalData.supplier.id]?.invoiceReceived ? '#10b981' : '#94a3b8', fontWeight: 700 }}>
                                                        {supplierStates[modalData.supplier.id]?.invoiceReceived ? '✅ Verified' : '❌ Pending'}
                                                    </span>
                                                </div>
                                                <div className="history-entry-card">
                                                    <span style={{ fontWeight: 700 }}>Shipment (GRN)</span>
                                                    <span style={{ color: supplierStates[modalData.supplier.id]?.shipmentVerified ? '#10b981' : '#94a3b8', fontWeight: 700 }}>
                                                        {supplierStates[modalData.supplier.id]?.shipmentVerified ? '✅ Completed' : '❌ Pending'}
                                                    </span>
                                                </div>
                                                {supplierStates[modalData.supplier.id]?.matchingRun && (
                                                    <>
                                                        <div className="history-entry-card" style={{ background: '#f0fdf4', borderColor: '#10b981' }}>
                                                            <span style={{ fontWeight: 700 }}>AI 3-Way Match</span>
                                                            <span style={{ color: '#10b981', fontWeight: 800 }}>{supplierStates[modalData.supplier.id]?.matchScore}% VERIFIED</span>
                                                        </div>
                                                        <div className="history-entry-card">
                                                            <span style={{ fontWeight: 700 }}>Manager Approval</span>
                                                            <span style={{ color: supplierStates[modalData.supplier.id]?.managerApproved ? '#10b981' : '#94a3b8', fontWeight: 700 }}>
                                                                {supplierStates[modalData.supplier.id]?.managerApproved ? '✅ Approved' : '❌ Pending'}
                                                            </span>
                                                        </div>
                                                        <div className="history-entry-card" style={{ gridColumn: '1 / -1', background: 'var(--primary-soft)' }}>
                                                            <span style={{ fontWeight: 700 }}>AI Match Report</span>
                                                            <span style={{ fontWeight: 800, color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setModalData({ supplier: modalData.supplier, type: 'report_view' })}>
                                                                📄 {supplierStates[modalData.supplier.id]?.matchFile}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : modalData.type === 'byok_connect' ? (
                                <div className="byok-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '5px' }}>SERVICE: {byokTarget?.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Enter your production or sandbox API key to establish a secure connection via MCP protocol.</div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>API KEY / TOKEN</label>
                                        <input
                                            type="password"
                                            placeholder="sk_live_..."
                                            value={byokKey}
                                            onChange={(e) => setByokKey(e.target.value)}
                                            style={{
                                                padding: '14px',
                                                borderRadius: '10px',
                                                border: '2px solid var(--primary-soft)',
                                                outline: 'none',
                                                fontSize: '1rem',
                                                letterSpacing: '2px'
                                            }}
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && submitBYOK()}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', background: '#ecfdf5', padding: '12px', borderRadius: '8px', border: '1px solid #10b981' }}>
                                        <span style={{ fontSize: '1.2rem' }}>🛡️</span>
                                        <span style={{ fontSize: '0.65rem', color: '#065f46', fontWeight: 800 }}>Keys are processed via secure MCP handlers and never stored as plaintext on our servers.</span>
                                    </div>

                                </div>
                            ) : (
                                <>
                                    <div className="upload-zone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
                                        e.preventDefault();
                                        handleUpload(modalData.supplier.id, modalData.type, ['mock_file.pdf']);
                                    }}>
                                        <div className="upload-icon">📁</div>
                                        <p>Drag & Drop {modalData.type.toUpperCase()} documents here</p>
                                        <span>or click to browse from secure storage</span>
                                        <input type="file" style={{ display: 'none' }} id="file-upload" onChange={() => handleUpload(modalData.supplier.id, modalData.type, ['uploaded_doc.pdf'])} />
                                        <button className="po-btn mini" style={{ marginTop: '1rem', width: 'auto', padding: '10px 20px' }} onClick={() => document.getElementById('file-upload').click()}>
                                            Select Files
                                        </button>
                                    </div>

                                    <div className="mockup-section">
                                        <h4>ATTACHED DOCS</h4>
                                        <div className="template-grid">
                                            <div className="template-item">📄 {modalData.supplier.name.replace(/\s/g, '_')}_{modalData.type.toUpperCase()}_v1.pdf</div>
                                            <div className="template-item">📄 Signed_Company_Profile.pdf</div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="mini-btn" onClick={() => { setModalData(null); setPoInputValue(''); }}>
                                {modalData.type === 'history' ? 'Close' : 'Cancel'}
                            </button>
                            {modalData.type === 'po_create' ? (
                                <button
                                    className="po-btn"
                                    style={{ margin: 0, width: 'auto', padding: '10px 30px' }}
                                    onClick={submitPO}
                                    disabled={!poInputValue.trim()}
                                >
                                    Generate & Issue PO
                                </button>
                            ) : modalData.type === 'byok_connect' ? (
                                <button
                                    className="po-btn"
                                    style={{ margin: 0, width: 'auto', padding: '10px 30px' }}
                                    onClick={submitBYOK}
                                >
                                    Verify & Connect
                                </button>
                            ) : modalData.type !== 'history' && (
                                <button className="po-btn" style={{ margin: 0, width: 'auto', padding: '10px 30px' }} onClick={() => handleUpload(modalData.supplier.id, modalData.type, ['mock_file.pdf'])}>
                                    Submit Request
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className={`toast-notification ${toast.type}`}>
                    <div className="toast-icon">{toast.type === 'success' ? '✅' : 'ℹ️'}</div>
                    <div className="toast-message">{toast.message}</div>
                </div>
            )}
        </div>
    );
}

export default App;
