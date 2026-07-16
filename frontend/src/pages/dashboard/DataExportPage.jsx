import React, { useState, useRef } from 'react';
import {
    Download, Upload, History, FileJson, FileSpreadsheet, FileText,
    RefreshCw, CheckCircle, XCircle, X, Eye, Undo2, AlertTriangle,
    ChevronDown, ChevronUp, CheckSquare, Database,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dataExportService from '../../services/dataExportService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, bb, bc, ba } from '../../utils/homeConstants';

const EXPORT_GROUPS = [
    { id: 'expenses',       label: 'Expenses',                desc: 'All expense records',                 warn: null },
    { id: 'salaries',       label: 'Salaries',                desc: 'Salary requests and payment history', warn: null },
    { id: 'reports',        label: 'Reports & Replies',       desc: 'Reports and their reply threads',     warn: null },
    { id: 'research',       label: 'Research',                desc: 'Research records and content',        warn: null },
    { id: 'meetings',       label: 'Meetings',                desc: 'Meeting records with participants',   warn: null },
    { id: 'internships',    label: 'Internship Applications', desc: 'All internship application records',  warn: null },
    { id: 'hostedWebsites', label: 'Hosted Websites',         desc: 'Hosted website directory',            warn: null },
    { id: 'weeklyGoals',    label: 'Weekly Goals',            desc: 'Weekly goal records and tasks',       warn: null },
    { id: 'demoRequests',   label: 'Demo Requests',           desc: 'Demo request records',                warn: null },
    { id: 'notifications',  label: 'Notifications',           desc: 'System notification records',         warn: 'Can be very large' },
];

const GROUP_LABELS = {
    expenses:       'Expenses',
    salaries:       'Salaries',
    reports:        'Reports & Replies',
    research:       'Research',
    meetings:       'Meetings',
    internships:    'Internship Applications',
    hostedWebsites: 'Hosted Websites',
    weeklyGoals:    'Weekly Goals',
    demoRequests:   'Demo Requests',
    notifications:  'Notifications',
};

const STRATEGY_INFO = {
    SKIP:              { label: 'Skip duplicates',      desc: 'Existing records are left unchanged. Only new records are imported.' },
    OVERWRITE:         { label: 'Overwrite duplicates', desc: 'Existing records are updated with data from the backup file.' },
    ABORT_ON_CONFLICT: { label: 'Abort on conflict',   desc: 'If any conflicts are found, the entire import is cancelled.' },
};

const DataExportPage = () => {
    const { bg, bg2, bg3, textC, text2, border } = useDashboardTheme();

    // Export
    const [exportFormat, setExportFormat] = useState('json');
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [isExporting, setIsExporting] = useState(false);

    // Import wizard
    const [importStep, setImportStep] = useState(0); // 0=strategy, 1=upload, 2=preview, 3=done
    const [importStrategy, setImportStrategy] = useState('SKIP');
    const [importGroups, setImportGroups] = useState([]);
    const [dragOver, setDragOver] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);

    // History
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [rollbackTarget, setRollbackTarget] = useState(null);
    const [isRollingBack, setIsRollingBack] = useState(false);

    // Toast
    const [toast, setToast] = useState(null);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const toggleGroup = (id) =>
        setSelectedGroups((p) => p.includes(id) ? p.filter((g) => g !== id) : [...p, id]);

    const toggleImportGroup = (id) =>
        setImportGroups((p) => p.includes(id) ? p.filter((g) => g !== id) : [...p, id]);

    // ── Export ──────────────────────────────────────────────────────────
    const handleExport = async () => {
        try {
            setIsExporting(true);
            await dataExportService.exportData({ format: exportFormat, groups: selectedGroups });
            showToast('success', 'Export downloaded successfully');
        } catch (err) {
            showToast('error', err.message || 'Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    // ── Import file pick ─────────────────────────────────────────────────
    const handleFilePick = (e) => {
        const file = e.target?.files?.[0];
        if (file && file.name.endsWith('.json')) {
            setImportFile(file);
        } else if (file) {
            showToast('error', 'Please upload a .json backup file');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer?.files?.[0];
        if (file && file.name.endsWith('.json')) {
            setImportFile(file);
        } else if (file) {
            showToast('error', 'Please upload a .json backup file');
        }
    };

    // ── Import preview ───────────────────────────────────────────────────
    const handlePreview = async () => {
        if (!importFile) return;
        try {
            setIsPreviewing(true);
            const data = await dataExportService.importPreview(importFile, { strategy: importStrategy, groups: importGroups });
            setPreviewData(data);
            setImportStep(2);
        } catch (err) {
            showToast('error', err.message || 'Preview failed');
        } finally {
            setIsPreviewing(false);
        }
    };

    // ── Import commit ────────────────────────────────────────────────────
    const handleImport = async () => {
        if (!importFile) return;
        try {
            setIsImporting(true);
            const result = await dataExportService.importData(importFile, { strategy: importStrategy, groups: importGroups });
            setImportResult(result);
            setImportStep(3);
            showToast('success', 'Import completed successfully');
        } catch (err) {
            showToast('error', err.message || 'Import failed');
        } finally {
            setIsImporting(false);
        }
    };

    const resetImport = () => {
        setImportStep(0);
        setImportFile(null);
        setPreviewData(null);
        setImportResult(null);
        setImportGroups([]);
        setImportStrategy('SKIP');
    };

    // ── History ──────────────────────────────────────────────────────────
    const loadHistory = async () => {
        try {
            setHistoryLoading(true);
            const data = await dataExportService.getImportHistory();
            setHistory(data);
            setHistoryOpen(true);
        } catch {
            showToast('error', 'Failed to load history');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleRollback = async () => {
        if (!rollbackTarget) return;
        try {
            setIsRollingBack(true);
            await dataExportService.rollbackImport(rollbackTarget.id);
            showToast('success', 'Rollback completed');
            setRollbackTarget(null);
            await loadHistory();
        } catch (err) {
            showToast('error', err.message || 'Rollback failed');
        } finally {
            setIsRollingBack(false);
        }
    };

    const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString() : '—');
    const totalImported = (summary) =>
        Array.isArray(summary) ? summary.reduce((a, r) => a + (r.created ?? 0) + (r.updated ?? 0), 0) : 0;

    // ── Shared style helpers ─────────────────────────────────────────────
    const card = { background: bg2, border: '1px solid ' + border, borderRadius: 8, padding: 24, marginBottom: 24 };
    const sectionTitle = bc(11, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 });
    const pill = (active) => ({
        padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
        cursor: 'pointer', transition: 'all .15s', border: 'none',
        ...(active ? { background: ORG, color: '#fff' } : { background: bg3, color: textC, border: '1px solid ' + border }),
    });
    const stepBtn = (primary, disabled) => ({
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '9px 20px', fontSize: 13, fontWeight: 700, borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all .15s', border: 'none',
        ...(primary
            ? { background: ORG, color: '#fff', opacity: disabled ? 0.55 : 1 }
            : { background: bg3, color: textC, border: '1px solid ' + border }),
    });

    return (
        <div style={{ background: bg, minHeight: '100vh' }}>
            {/* ── Page header ─────────────────────────────────────────── */}
            <div style={{ background: bg2, borderBottom: '1px solid ' + border, marginBottom: 0 }}>
                <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(232,98,26,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Database size={20} color={ORG} />
                        </div>
                        <div>
                            <h1 style={{ ...bb(26, { color: ORG, margin: 0, lineHeight: 1 }) }}>Data Export & Import</h1>
                            <p style={{ ...ba(12, 400, { color: text2, marginTop: 3 }) }}>Back up, restore, and manage your organisation data</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>

                {/* ══════════════════════════════════════════════════════ */}
                {/* EXPORT SECTION                                        */}
                {/* ══════════════════════════════════════════════════════ */}
                <div style={card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <div style={{ width: 3, height: 16, background: ORG, borderRadius: 2 }} />
                        <span style={sectionTitle}>Export Data</span>
                    </div>

                    {/* Format picker */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                        {[
                            { id: 'json',  Icon: FileJson,        label: 'JSON Backup',  desc: 'Full backup · re-importable' },
                            { id: 'excel', Icon: FileSpreadsheet, label: 'Excel Report',  desc: 'Spreadsheet · human-readable' },
                            { id: 'pdf',   Icon: FileText,        label: 'PDF Summary',   desc: 'Print-ready report' },
                        ].map(({ id, Icon, label, desc }) => (
                            <button
                                key={id}
                                onClick={() => setExportFormat(id)}
                                style={{
                                    flex: '1 1 160px', padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s',
                                    ...(exportFormat === id
                                        ? { background: 'rgba(232,98,26,.1)', border: '2px solid rgba(232,98,26,.5)' }
                                        : { background: bg3, border: '1px solid ' + border }),
                                }}
                            >
                                <Icon size={20} color={exportFormat === id ? ORG : text2} style={{ flexShrink: 0 }} />
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ ...ba(13, 700, { color: exportFormat === id ? ORG : textC }) }}>{label}</div>
                                    <div style={{ ...ba(11, 400, { color: text2 }) }}>{desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Group chips */}
                    <div style={{ marginBottom: 4 }}>
                        <p style={{ ...ba(12, 600, { color: text2, marginBottom: 10 }) }}>
                            Core data (Admins & Permissions) is always included. Add more:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                            {EXPORT_GROUPS.map((g) => (
                                <button key={g.id} onClick={() => toggleGroup(g.id)} title={g.desc + (g.warn ? ' ⚠ ' + g.warn : '')} style={pill(selectedGroups.includes(g.id))}>
                                    {g.warn && <AlertTriangle size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />}
                                    {g.label}
                                </button>
                            ))}
                        </div>
                        {selectedGroups.length > 0 && (
                            <button onClick={() => setSelectedGroups([])} style={{ fontSize: 11, color: text2, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                                Clear — export core only
                            </button>
                        )}
                    </div>

                    <div style={{ marginTop: 20 }}>
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            onClick={handleExport} disabled={isExporting}
                            style={stepBtn(true, isExporting)}
                        >
                            {isExporting ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />}
                            {isExporting ? 'Exporting…' : `Download ${exportFormat.toUpperCase()}`}
                        </motion.button>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════════ */}
                {/* IMPORT SECTION                                        */}
                {/* ══════════════════════════════════════════════════════ */}
                <div style={card}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 3, height: 16, background: ORG, borderRadius: 2 }} />
                            <span style={sectionTitle}>Import Data</span>
                        </div>
                        {importStep > 0 && (
                            <button onClick={resetImport} style={{ fontSize: 12, color: text2, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <X size={13} /> Start over
                            </button>
                        )}
                    </div>

                    {/* Step indicators */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                        {['Strategy', 'Upload File', 'Preview', 'Done'].map((label, i) => (
                            <React.Fragment key={label}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{
                                        width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0,
                                        ...(importStep === i
                                            ? { background: ORG, color: '#fff' }
                                            : importStep > i
                                                ? { background: 'rgba(74,222,128,.2)', color: '#4ade80', border: '1.5px solid #4ade80' }
                                                : { background: bg3, color: text2, border: '1px solid ' + border }),
                                    }}>
                                        {importStep > i ? <CheckCircle size={12} /> : i + 1}
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: importStep === i ? 700 : 400, color: importStep === i ? textC : text2 }}>{label}</span>
                                </div>
                                {i < 3 && <div style={{ flex: 1, height: 1, background: importStep > i ? 'rgba(74,222,128,.4)' : border }} />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* ── Step 0: Strategy ── */}
                    {importStep === 0 && (
                        <div>
                            <p style={{ ...ba(12, 600, { color: text2, marginBottom: 10 }) }}>Conflict resolution strategy:</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                                {Object.entries(STRATEGY_INFO).map(([key, info]) => (
                                    <button
                                        key={key}
                                        onClick={() => setImportStrategy(key)}
                                        style={{
                                            width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: 8,
                                            cursor: 'pointer', transition: 'all .15s',
                                            ...(importStrategy === key
                                                ? { background: 'rgba(232,98,26,.08)', border: '2px solid rgba(232,98,26,.4)' }
                                                : { background: bg3, border: '1px solid ' + border }),
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                                                border: '2px solid ' + (importStrategy === key ? ORG : border),
                                                background: importStrategy === key ? ORG : 'transparent',
                                            }} />
                                            <div>
                                                <div style={{ ...ba(13, 700, { color: importStrategy === key ? ORG : textC }) }}>{info.label}</div>
                                                <div style={{ ...ba(11, 400, { color: text2 }) }}>{info.desc}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <p style={{ ...ba(12, 600, { color: text2, marginBottom: 10 }) }}>Optional: limit to specific groups (leave empty for all):</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                                {EXPORT_GROUPS.map((g) => (
                                    <button key={g.id} onClick={() => toggleImportGroup(g.id)} style={pill(importGroups.includes(g.id))}>{g.label}</button>
                                ))}
                            </div>
                            {importGroups.length === 0 && (
                                <p style={{ ...ba(11, 400, { color: text2, marginBottom: 16 }) }}>No filter — all data in the backup will be imported.</p>
                            )}

                            <div style={{ marginTop: 16 }}>
                                <motion.button whileHover={{ scale: 1.02 }} onClick={() => setImportStep(1)} style={stepBtn(true, false)}>
                                    Continue
                                </motion.button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 1: Upload ── */}
                    {importStep === 1 && (
                        <div>
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => !importFile && fileInputRef.current?.click()}
                                style={{
                                    border: `2px dashed ${dragOver ? ORG : importFile ? '#4ade80' : border}`,
                                    borderRadius: 10, padding: '44px 24px', textAlign: 'center',
                                    cursor: importFile ? 'default' : 'pointer', transition: 'all .2s', marginBottom: 16,
                                    background: dragOver ? 'rgba(232,98,26,.04)' : importFile ? 'rgba(74,222,128,.05)' : bg3,
                                }}
                            >
                                <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFilePick} />
                                {importFile ? (
                                    <>
                                        <CheckCircle size={40} color="#4ade80" style={{ margin: '0 auto 10px' }} />
                                        <div style={{ ...ba(14, 700, { color: textC }) }}>{importFile.name}</div>
                                        <div style={{ ...ba(12, 400, { color: text2, marginTop: 2 }) }}>{(importFile.size / 1024).toFixed(1)} KB</div>
                                        <button onClick={(e) => { e.stopPropagation(); setImportFile(null); }}
                                            style={{ marginTop: 10, fontSize: 12, color: text2, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                                            Remove
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={40} color={text2} style={{ margin: '0 auto 10px' }} />
                                        <div style={{ ...ba(14, 600, { color: textC, marginBottom: 4 }) }}>Drop your backup file here</div>
                                        <div style={{ ...ba(12, 400, { color: text2 }) }}>or click to browse — accepts .json backup files</div>
                                    </>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => setImportStep(0)} style={stepBtn(false, false)}>Back</button>
                                <motion.button whileHover={{ scale: 1.02 }} onClick={handlePreview} disabled={!importFile || isPreviewing}
                                    style={{ ...stepBtn(true, !importFile || isPreviewing), flex: 1 }}>
                                    {isPreviewing ? <RefreshCw size={15} className="animate-spin" /> : <Eye size={15} />}
                                    {isPreviewing ? 'Analyzing…' : 'Preview Import'}
                                </motion.button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Preview ── */}
                    {importStep === 2 && previewData && (
                        <div>
                            {/* Stats row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                                {[
                                    { label: 'Will Create', value: previewData.wouldCreate, color: '#4ade80' },
                                    { label: 'Will Update', value: previewData.wouldUpdate, color: ORG },
                                    { label: 'Will Skip',   value: previewData.wouldSkip,   color: text2 },
                                ].map(({ label, value, color }) => (
                                    <div key={label} style={{ background: bg3, border: '1px solid ' + border, borderRadius: 8, padding: '14px 12px', textAlign: 'center' }}>
                                        <div style={{ ...bb(28, { color, lineHeight: 1, marginBottom: 4 }) }}>{value}</div>
                                        <div style={{ ...ba(11, 600, { color: text2 }) }}>{label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Detected groups */}
                            {previewData.detectedGroups?.length > 0 && (
                                <div style={{ marginBottom: 14 }}>
                                    <p style={{ ...ba(11, 600, { color: text2, marginBottom: 6 }) }}>Detected data groups in file:</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {previewData.detectedGroups.map((g) => (
                                            <span key={g} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(232,98,26,.12)', color: ORG }}>
                                                {GROUP_LABELS[g] ?? g}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Warnings */}
                            {previewData.warnings?.length > 0 && (
                                <div style={{ background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
                                    <p style={{ ...ba(12, 700, { color: '#fbbf24', marginBottom: 6 }) }}>Warnings</p>
                                    {previewData.warnings.map((w, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, ...ba(12, 400, { color: '#fbbf24' }) }}>
                                            <AlertTriangle size={13} style={{ flexShrink: 0 }} />{w}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p style={{ ...ba(12, 400, { color: text2, marginBottom: 16 }) }}>
                                Strategy: <strong style={{ color: textC }}>{STRATEGY_INFO[importStrategy]?.label}</strong>
                                {importGroups.length > 0 && <> · Groups: <strong style={{ color: textC }}>{importGroups.map((g) => GROUP_LABELS[g] ?? g).join(', ')}</strong></>}
                            </p>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => setImportStep(1)} style={stepBtn(false, false)}>Back</button>
                                <motion.button whileHover={{ scale: 1.02 }} onClick={handleImport} disabled={isImporting}
                                    style={{ ...stepBtn(true, isImporting), flex: 1 }}>
                                    {isImporting ? <RefreshCw size={15} className="animate-spin" /> : <Upload size={15} />}
                                    {isImporting ? 'Importing…' : 'Confirm Import'}
                                </motion.button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Done ── */}
                    {importStep === 3 && importResult && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <CheckSquare size={32} color="#4ade80" style={{ flexShrink: 0 }} />
                                <div>
                                    <div style={{ ...ba(16, 700, { color: textC }) }}>Import Complete</div>
                                    <div style={{ ...ba(12, 400, { color: text2 }) }}>
                                        {totalImported(importResult.summary)} records imported · Snapshot: <code style={{ fontSize: 11 }}>{importResult.snapshotId?.slice(0, 12)}…</code>
                                    </div>
                                </div>
                            </div>

                            {Array.isArray(importResult.summary) && importResult.summary.length > 0 && (
                                <div style={{ background: bg3, border: '1px solid ' + border, borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                                            <thead>
                                                <tr style={{ background: 'rgba(232,98,26,.08)', borderBottom: '1px solid ' + border }}>
                                                    {['Entity', 'Total', 'Created', 'Updated', 'Skipped', 'Failed'].map((h) => (
                                                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', ...bc(10, 700, { color: text2, letterSpacing: 2 }) }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importResult.summary.map((r, i) => (
                                                    <tr key={i} style={{ borderBottom: i < importResult.summary.length - 1 ? '1px solid ' + border : 'none' }}>
                                                        <td style={{ padding: '8px 12px', ...ba(12, 600, { color: textC }) }}>{r.entity}</td>
                                                        <td style={{ padding: '8px 12px', ...ba(12, 400, { color: text2 }) }}>{r.total}</td>
                                                        <td style={{ padding: '8px 12px', ...ba(12, r.created > 0 ? 700 : 400, { color: r.created > 0 ? '#4ade80' : text2 }) }}>{r.created}</td>
                                                        <td style={{ padding: '8px 12px', ...ba(12, r.updated > 0 ? 700 : 400, { color: r.updated > 0 ? ORG : text2 }) }}>{r.updated}</td>
                                                        <td style={{ padding: '8px 12px', ...ba(12, 400, { color: text2 }) }}>{r.skipped}</td>
                                                        <td style={{ padding: '8px 12px', ...ba(12, r.failed > 0 ? 700 : 400, { color: r.failed > 0 ? '#e84040' : text2 }) }}>{r.failed}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <motion.button whileHover={{ scale: 1.02 }} onClick={resetImport} style={stepBtn(true, false)}>
                                    Import Another File
                                </motion.button>
                                <button onClick={() => { resetImport(); loadHistory(); }} style={stepBtn(false, false)}>
                                    <History size={15} /> View History
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ══════════════════════════════════════════════════════ */}
                {/* IMPORT HISTORY                                        */}
                {/* ══════════════════════════════════════════════════════ */}
                <div style={{ ...card, marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: historyOpen ? 16 : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 3, height: 16, background: ORG, borderRadius: 2 }} />
                            <span style={sectionTitle}>Import History</span>
                        </div>
                        <button
                            onClick={historyOpen ? () => setHistoryOpen(false) : loadHistory}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', fontSize: 12, fontWeight: 600, background: bg3, border: '1px solid ' + border, borderRadius: 6, color: textC, cursor: 'pointer' }}
                        >
                            {historyLoading ? <RefreshCw size={13} className="animate-spin" /> : <History size={13} />}
                            {historyOpen ? 'Hide' : 'Load History'}
                            {historyOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                    </div>

                    <AnimatePresence>
                        {historyOpen && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                                {history.length === 0 ? (
                                    <div style={{ padding: '24px 0', textAlign: 'center', ...ba(13, 400, { color: text2 }) }}>No import history found.</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {history.map((snap) => (
                                            <div key={snap.id} style={{ background: bg3, border: '1px solid ' + border, borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ ...ba(13, 600, { color: textC }) }}>{snap.fileName}</div>
                                                    <div style={{ ...ba(11, 400, { color: text2 }) }}>
                                                        {fmtDate(snap.createdAt)} · by {snap.performedByName} · {snap.strategy}
                                                    </div>
                                                    <div style={{ ...ba(11, 400, { color: text2 }) }}>
                                                        {totalImported(snap.summary)} records imported
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                                    <span style={{
                                                        padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                                                        ...(snap.status === 'active'
                                                            ? { background: 'rgba(74,222,128,.15)', color: '#4ade80' }
                                                            : { background: 'rgba(120,120,120,.15)', color: text2 }),
                                                    }}>
                                                        {snap.status}
                                                    </span>
                                                    {snap.status === 'active' && (
                                                        <button
                                                            onClick={() => setRollbackTarget(snap)}
                                                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', fontSize: 11, fontWeight: 700, background: 'rgba(232,64,64,.1)', color: '#e84040', border: '1px solid rgba(232,64,64,.3)', borderRadius: 6, cursor: 'pointer' }}
                                                        >
                                                            <Undo2 size={13} /> Rollback
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Toast ───────────────────────────────────────────────── */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 8,
                            fontSize: 13, fontWeight: 600, border: '1px solid', maxWidth: 380,
                            ...(toast.type === 'success'
                                ? { background: 'rgba(74,222,128,.15)', borderColor: '#4ade80', color: '#4ade80' }
                                : { background: 'rgba(232,64,64,.15)',  borderColor: '#e84040', color: '#e84040' }),
                        }}>
                            {toast.type === 'success' ? <CheckCircle size={16} style={{ flexShrink: 0 }} /> : <XCircle size={16} style={{ flexShrink: 0 }} />}
                            <span style={{ flex: 1 }}>{toast.message}</span>
                            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 2 }}>
                                <X size={14} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Rollback confirmation dialog ─────────────────────────── */}
            <AnimatePresence>
                {rollbackTarget && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
                        onClick={() => !isRollingBack && setRollbackTarget(null)}>
                        <motion.div initial={{ scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .92, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ background: bg2, border: '1px solid rgba(232,64,64,.4)', borderRadius: 10, padding: 28, maxWidth: 440, width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <AlertTriangle size={22} color="#e84040" />
                                <h3 style={{ ...ba(17, 700, { color: textC, margin: 0 }) }}>Rollback Import?</h3>
                            </div>
                            <p style={{ ...ba(13, 400, { color: text2, marginBottom: 8 }) }}>
                                This will permanently delete all <strong style={{ color: textC }}>{totalImported(rollbackTarget.summary)}</strong> records that were created by this import.
                            </p>
                            <p style={{ ...ba(12, 400, { color: text2, marginBottom: 20 }) }}>
                                File: <strong style={{ color: textC }}>{rollbackTarget.fileName}</strong><br />
                                Imported: {fmtDate(rollbackTarget.createdAt)} · by {rollbackTarget.performedByName}
                            </p>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                <button onClick={() => setRollbackTarget(null)} disabled={isRollingBack} style={stepBtn(false, isRollingBack)}>Cancel</button>
                                <button onClick={handleRollback} disabled={isRollingBack}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', fontSize: 13, fontWeight: 700, background: '#e84040', color: '#fff', border: 'none', borderRadius: 6, cursor: isRollingBack ? 'not-allowed' : 'pointer', opacity: isRollingBack ? 0.6 : 1 }}>
                                    {isRollingBack ? <RefreshCw size={14} className="animate-spin" /> : <Undo2 size={14} />}
                                    {isRollingBack ? 'Rolling back…' : 'Yes, rollback'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DataExportPage;
