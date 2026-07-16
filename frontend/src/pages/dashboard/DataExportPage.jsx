import React, { useState, useRef, Fragment } from 'react';
import {
    Download, Upload, History, FileJson, FileSpreadsheet, FileText,
    RefreshCw, CheckCircle, XCircle, X, AlertTriangle,
    ChevronDown, Database, ArrowLeft, ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dataExportService from '../../services/dataExportService';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, bb, bc, ba } from '../../utils/homeConstants';

// ─── Constants ────────────────────────────────────────

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
    core:           'Core Data',
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

const FORMAT_OPTIONS = [
    { id: 'json',  label: 'JSON — Full Backup',  desc: 'Complete re-importable backup',          Icon: FileJson },
    { id: 'excel', label: 'Excel — Spreadsheet',  desc: 'One sheet per entity, human-readable',   Icon: FileSpreadsheet },
    { id: 'pdf',   label: 'PDF — Summary Report', desc: 'Print-ready organisation overview',      Icon: FileText },
];

const CONFLICT_STRATEGIES = [
    { id: 'SKIP',              label: 'Skip duplicates',     badge: 'Recommended',    desc: 'Existing records are left unchanged. Only new records are imported.' },
    { id: 'OVERWRITE',         label: 'Overwrite duplicates', badge: 'Updates data',   desc: 'Existing records are updated with data from the backup file.' },
    { id: 'ABORT_ON_CONFLICT', label: 'Abort on conflict',   badge: 'Strictest',      desc: 'If any conflicts are found, the entire import is cancelled.' },
];

export default function DataExportPage() {
    const theme = useDashboardTheme();
    const { bg, bg2, bg3, textC, text2, border } = theme;

    const [tab, setTab] = useState('export');

    // ── Export state ──────────────────────────────────
    const [exportStep, setExportStep]       = useState(1);
    const [exportDone, setExportDone]       = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [exportError, setExportError]     = useState('');
    const [groups, setGroups]               = useState([]);
    const [format, setFormat]               = useState('json');

    // ── Import state ──────────────────────────────────
    const [importStep, setImportStep]       = useState(1);
    const [importDone, setImportDone]       = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [importError, setImportError]     = useState('');
    const [conflictStrategy, setConflictStrategy] = useState('SKIP');
    const [file, setFile]                   = useState(null);
    const [drag, setDrag]                   = useState(false);
    const [preview, setPreview]             = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError]   = useState('');
    const [results, setResults]             = useState(null);
    const [importGroups, setImportGroups]   = useState(null); // null = all groups
    const fileInputRef = useRef(null);

    // ── History state ─────────────────────────────────
    const [history, setHistory]               = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [rollbackTarget, setRollbackTarget] = useState(null);
    const [rollbackLoading, setRollbackLoading] = useState(false);
    const [rollbackError, setRollbackError]   = useState('');

    // ── Toast ──────────────────────────────────────────
    const [toast, setToast] = useState(null);
    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    // ─── Export logic ──────────────────────────────────

    const runExport = async () => {
        setExportLoading(true); setExportError('');
        try {
            await dataExportService.exportData({ format, groups });
            setExportDone(true);
            showToast('success', 'Export downloaded successfully');
        } catch (err) {
            setExportError(err?.message ?? 'Export failed. Please try again.');
        } finally {
            setExportLoading(false);
        }
    };

    const resetExport = () => {
        setExportDone(false); setExportStep(1); setExportError('');
        setGroups([]); setFormat('json');
    };

    // ─── Import logic ──────────────────────────────────

    const loadPreview = async (f, strategy) => {
        setPreview(null); setPreviewError(''); setPreviewLoading(true);
        try {
            const data = await dataExportService.importPreview(f, { strategy, groups: [] });
            setPreview(data);
            if (data.detectedGroups?.length > 0) setImportGroups(data.detectedGroups);
        } catch (err) {
            setPreviewError(err?.message ?? 'Could not read file. Make sure it is a valid AbyTech Hub backup.');
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleFile = (f) => {
        if (!f) return;
        if (!f.name.endsWith('.json')) {
            setPreviewError('Please upload a .json backup file');
            return;
        }
        setFile(f); setPreview(null); setResults(null); setImportError(''); setPreviewError('');
    };

    const runImport = async () => {
        if (!file) return;
        setImportLoading(true); setImportError('');
        try {
            const data = await dataExportService.importData(file, { strategy: conflictStrategy, groups: importGroups ?? [] });
            setResults(data);
            setImportDone(true);
            showToast('success', 'Import completed successfully');
            loadHistory();
        } catch (err) {
            setImportError(err?.message ?? 'Import failed.');
        } finally {
            setImportLoading(false);
        }
    };

    const toggleImportGroup = (g) => {
        setImportGroups(prev => {
            const current = prev ?? [];
            return current.includes(g) ? current.filter(x => x !== g) : [...current, g];
        });
    };

    const resetImport = () => {
        setImportDone(false); setImportStep(1); setImportError('');
        setFile(null); setPreview(null); setPreviewError(''); setResults(null);
        setConflictStrategy('SKIP'); setImportGroups(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const loadHistory = async () => {
        if (historyLoading) return;
        setHistoryLoading(true);
        try { setHistory(await dataExportService.getImportHistory()); }
        catch { /* silent */ }
        finally { setHistoryLoading(false); }
    };

    const confirmRollback = async () => {
        if (!rollbackTarget) return;
        setRollbackLoading(true); setRollbackError('');
        try {
            await dataExportService.rollbackImport(rollbackTarget.id);
            setRollbackTarget(null);
            showToast('success', 'Rollback completed');
            loadHistory();
        } catch (err) {
            setRollbackError(err?.message ?? 'Rollback failed.');
        } finally {
            setRollbackLoading(false);
        }
    };

    // ─── Navigation ────────────────────────────────────

    const isExport = tab === 'export';
    const curStep  = isExport ? exportStep : importStep;
    const isDone   = isExport ? exportDone : importDone;

    const handleBack = () => {
        if (isExport) setExportStep(s => Math.max(1, s - 1));
        else           setImportStep(s => Math.max(1, s - 1));
    };

    const handleNext = async () => {
        if (isExport) {
            if (exportStep === 3) { await runExport(); return; }
            setExportStep(s => s + 1);
            return;
        }
        if (importStep === 3) { await runImport(); return; }
        if (importStep === 2 && file && !preview) {
            await loadPreview(file, conflictStrategy);
        }
        setImportStep(s => s + 1);
    };

    const nextDisabled =
        (isExport  && exportLoading) ||
        (!isExport && importLoading) ||
        (!isExport && importStep === 2 && !file) ||
        (!isExport && importStep === 3 && (previewLoading || !!previewError)) ||
        (!isExport && importStep === 3 && importGroups !== null && importGroups.length === 0);

    const nextLabel =
        exportLoading ? 'Exporting…' :
        importLoading ? 'Importing…' :
        curStep === 3 ? (isExport ? 'Export Now' : 'Import Now') :
        'Continue';

    // ─── Derived ───────────────────────────────────────

    const selGroups = EXPORT_GROUPS.filter(g => groups.includes(g.id));
    const selFormat = FORMAT_OPTIONS.find(f => f.id === format) ?? FORMAT_OPTIONS[0];
    const selStrat  = CONFLICT_STRATEGIES.find(cs => cs.id === conflictStrategy) ?? CONFLICT_STRATEGIES[0];
    const largeGroups = selGroups.filter(g => g.warn);

    const EXPORT_LABELS = ['Select Data', 'Format', 'Review'];
    const IMPORT_LABELS = ['Strategy', 'Upload File', 'Preview'];

    // ─── Shared style tokens ───────────────────────────

    const panel      = { background: bg2, border: '1px solid ' + border, borderRadius: 10, overflow: 'hidden' };
    const panelHead  = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '13px 18px', borderBottom: '1px solid ' + border, flexWrap: 'wrap' };
    const panelTitleWrap = (label, sub) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 3, height: 15, background: ORG, borderRadius: 2 }} />
            <span style={{ ...bc(11, 700, { letterSpacing: 2, textTransform: 'uppercase', color: textC }) }}>{label}</span>
            {sub && <span style={{ ...ba(11, 400, { color: text2 }) }}>{sub}</span>}
        </div>
    );
    const chip = (active) => ({
        border: `1px solid ${active ? ORG : border}`,
        background: active ? 'rgba(232,98,26,.12)' : 'transparent',
        color: active ? ORG : text2,
        borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
    });
    const navBtn = (primary, disabled) => ({
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '9px 20px', fontSize: 13, fontWeight: 700, borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all .15s', border: primary ? 'none' : '1px solid ' + border,
        background: primary ? ORG : bg3, color: primary ? '#fff' : textC, opacity: disabled ? 0.55 : 1,
    });

    function Dot({ checked }) {
        return (
            <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${checked ? ORG : border}`, background: checked ? ORG : bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .12s' }}>
                {checked && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />}
            </div>
        );
    }

    function Checkbox({ checked }) {
        return (
            <div style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0, marginTop: 1, border: `1px solid ${checked ? ORG : border}`, background: checked ? ORG : bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .12s' }}>
                {checked && (
                    <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                        <path d="M1 3.5l2.5 2.5 3.5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>
        );
    }

    function sv(n, curr) {
        const done = curr > n, active = curr === n;
        return {
            bg:    done ? '#4ade80' : active ? ORG : bg3,
            color: (done || active) ? '#fff' : text2,
            text:  done ? '✓' : String(n),
            labelColor: active ? ORG : done ? '#4ade80' : text2,
        };
    }

    const renderWizard = (curr, labels) => (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, padding: '0 4px' }}>
            {[1, 2, 3].map((n, i) => {
                const s = sv(n, curr);
                return (
                    <Fragment key={n}>
                        {i > 0 && (
                            <div style={{ flex: 1, height: 1, margin: '0 10px', marginBottom: 15, transition: 'background .3s', background: curr > i ? '#4ade80' : border }} />
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, transition: 'all .25s', background: s.bg, color: s.color }}>
                                {s.text}
                            </div>
                            <span style={{ ...bc(10, 700, { letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap', color: s.labelColor }) }}>
                                {labels[i]}
                            </span>
                        </div>
                    </Fragment>
                );
            })}
        </div>
    );

    // ─── ResultRow ─────────────────────────────────────

    function ResultRow({ r }) {
        const [open, setOpen] = useState(false);
        const hasWarnings = r.warnings?.length > 0;
        const dotColor = r.failed > 0 ? '#e84040' : hasWarnings ? '#fbbf24' : '#4ade80';

        return (
            <div style={{ border: '1px solid ' + border, borderRadius: 6, overflow: 'hidden', marginBottom: 4 }}>
                <button
                    onClick={() => hasWarnings && setOpen(o => !o)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: 'none', border: 'none', cursor: hasWarnings ? 'pointer' : 'default', textAlign: 'left' }}
                >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                    <span style={{ flex: 1, ...ba(12, 600, { color: textC }) }}>{r.entity}</span>
                    <span style={{ display: 'flex', gap: 10, ...ba(11, 400, { color: text2 }) }}>
                        {r.created > 0 && <span style={{ color: '#4ade80' }}>+{r.created} created</span>}
                        {r.updated > 0 && <span style={{ color: ORG }}>↑{r.updated} updated</span>}
                        {r.skipped > 0 && <span style={{ color: '#fbbf24' }}>{r.skipped} skipped</span>}
                        {r.failed  > 0 && <span style={{ color: '#e84040' }}>{r.failed} failed</span>}
                        {!r.created && !r.updated && !r.skipped && !r.failed && <span>no changes</span>}
                    </span>
                    {hasWarnings && (
                        <ChevronDown size={12} style={{ flexShrink: 0, color: text2, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
                    )}
                </button>
                {open && hasWarnings && (
                    <div style={{ padding: '8px 14px 10px', borderTop: '1px solid ' + border, background: 'rgba(251,191,36,.08)' }}>
                        {r.warnings.map((w, i) => (
                            <p key={i} style={{ ...ba(11, 400, { color: '#fbbf24', lineHeight: 1.5 }) }}>{w}</p>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // ─── Export step 1 — data groups ───────────────────

    const renderExportStep1 = () => (
        <div>
            <div style={{ ...panel, marginBottom: 10 }}>
                <div style={panelHead}>
                    {panelTitleWrap('Data Groups')}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ ...ba(11, 600, { color: ORG }) }}>{groups.length}/{EXPORT_GROUPS.length} selected</span>
                        <button onClick={() => setGroups(EXPORT_GROUPS.map(g => g.id))} style={{ ...navBtn(false, false), padding: '4px 10px', fontSize: 11 }}>All</button>
                        <button onClick={() => setGroups([])} style={{ ...navBtn(false, false), padding: '4px 10px', fontSize: 11 }}>None</button>
                    </div>
                </div>
                {/* Core data locked row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 18px', background: bg3, borderBottom: '1px solid ' + border }}>
                    <div style={{ width: 14, height: 14, borderRadius: 3, background: '#4ade80', border: '1px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <svg width="8" height="7" viewBox="0 0 8 7" fill="none"><path d="M1 3.5l2.5 2.5 3.5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                        <span style={{ ...ba(12, 700, { color: textC }) }}>Core Data</span>
                        <span style={{ ...ba(11, 400, { color: text2, marginLeft: 6 }) }}>always included</span>
                        <div style={{ ...ba(11, 400, { color: text2, marginTop: 1 }) }}>Admins, Permissions</div>
                    </div>
                </div>
                {EXPORT_GROUPS.map(g => {
                    const c = groups.includes(g.id);
                    return (
                        <div
                            key={g.id}
                            onClick={() => setGroups(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                            style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 18px', cursor: 'pointer', borderBottom: '1px solid ' + border, background: c ? 'rgba(232,98,26,.08)' : 'transparent', transition: 'background .1s' }}
                        >
                            <Checkbox checked={c} />
                            <div style={{ flex: 1 }}>
                                <div style={{ ...ba(12, 600, { color: textC }) }}>{g.label}</div>
                                <div style={{ ...ba(11, 400, { color: text2, marginTop: 1 }) }}>{g.desc}</div>
                            </div>
                            {g.warn && (
                                <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: 'rgba(251,191,36,.15)', color: '#fbbf24' }}>{g.warn}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // ─── Export step 2 — format ────────────────────────

    const renderExportStep2 = () => (
        <div style={panel}>
            <div style={panelHead}>{panelTitleWrap('Export Format')}</div>
            <div style={{ padding: 14 }}>
                {FORMAT_OPTIONS.map(opt => {
                    const sel = format === opt.id;
                    const Icon = opt.Icon;
                    return (
                        <div key={opt.id} onClick={() => setFormat(opt.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${sel ? ORG : border}`, background: sel ? 'rgba(232,98,26,.08)' : bg3, marginBottom: 6, transition: 'all .12s' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: sel ? 'rgba(232,98,26,.15)' : bg2 }}>
                                <Icon size={18} color={sel ? ORG : text2} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ ...ba(12, 700, { color: sel ? ORG : textC }) }}>{opt.label}</div>
                                <div style={{ ...ba(11, 400, { color: text2, marginTop: 2 }) }}>{opt.desc}</div>
                            </div>
                            <div style={{ marginTop: 2 }}><Dot checked={sel} /></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // ─── Export step 3 — review ────────────────────────

    const renderExportStep3 = () => (
        <div style={panel}>
            <div style={panelHead}>{panelTitleWrap('Review Export')}</div>
            <div style={{ display: 'grid', gap: 1, background: border }}>
                <div style={{ background: bg2, padding: '12px 18px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(232,98,26,.12)', color: ORG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Database size={13} />
                    </div>
                    <div>
                        <div style={{ ...bc(10, 700, { letterSpacing: 1, color: text2, textTransform: 'uppercase', marginBottom: 3 }) }}>Data Groups</div>
                        <div style={{ ...ba(12, 700, { color: textC }) }}>
                            {groups.length === 0 ? 'Core data only' : `Core data + ${groups.length} more (${selGroups.map(g => g.label).join(', ')})`}
                        </div>
                    </div>
                </div>
                <div style={{ background: bg2, padding: '12px 18px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(232,98,26,.12)', color: ORG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <selFormat.Icon size={13} />
                    </div>
                    <div>
                        <div style={{ ...bc(10, 700, { letterSpacing: 1, color: text2, textTransform: 'uppercase', marginBottom: 3 }) }}>Format</div>
                        <div style={{ ...ba(12, 700, { color: textC }) }}>{selFormat.label}</div>
                    </div>
                </div>
            </div>
            {largeGroups.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 18px', borderTop: '1px solid ' + border, background: 'rgba(251,191,36,.08)' }}>
                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1, color: '#fbbf24' }} />
                    <p style={{ ...ba(11, 600, { color: '#fbbf24', lineHeight: 1.5 }) }}>
                        {largeGroups.map(g => g.label).join(', ')} can produce very large files.
                    </p>
                </div>
            )}
            {exportError && (
                <div style={{ padding: '10px 18px', borderTop: '1px solid ' + border, background: 'rgba(232,64,64,.1)', color: '#e84040', fontSize: 12 }}>
                    {exportError}
                </div>
            )}
        </div>
    );

    // ─── Export done ───────────────────────────────────

    const renderExportDone = () => (
        <div style={{ ...panel, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', background: 'rgba(74,222,128,.15)', marginBottom: 16 }}>
                <CheckCircle size={26} color="#4ade80" />
            </div>
            <div style={{ ...bb(20, { color: textC, marginBottom: 6 }) }}>Export complete</div>
            <div style={{ ...ba(12, 400, { color: text2, marginBottom: 20 }) }}>
                {groups.length + 1} data group{groups.length + 1 !== 1 ? 's' : ''} exported as {selFormat.label}
            </div>
            <button onClick={resetExport} style={navBtn(true, false)}>New export</button>
        </div>
    );

    // ─── Import step 1 — strategy ──────────────────────

    const renderImportStep1 = () => (
        <div style={panel}>
            <div style={panelHead}>{panelTitleWrap('Import Strategy', 'What happens when a record already exists?')}</div>
            <div style={{ padding: 14 }}>
                {CONFLICT_STRATEGIES.map(strat => {
                    const sel = conflictStrategy === strat.id;
                    return (
                        <div key={strat.id} onClick={() => setConflictStrategy(strat.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${sel ? ORG : border}`, background: sel ? 'rgba(232,98,26,.08)' : bg3, marginBottom: 6, transition: 'all .12s' }}>
                            <div style={{ marginTop: 3 }}><Dot checked={sel} /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                    <span style={{ ...ba(12, 700, { color: textC }) }}>{strat.label}</span>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 7px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: 'rgba(232,98,26,.12)', color: ORG, whiteSpace: 'nowrap' }}>
                                        {strat.badge}
                                    </span>
                                </div>
                                <div style={{ ...ba(11, 400, { color: text2, lineHeight: 1.5 }) }}>{strat.desc}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // ─── Import step 2 — upload ────────────────────────

    const renderImportStep2 = () => (
        <div style={panel}>
            <div style={panelHead}>{panelTitleWrap('Upload File')}</div>
            <div style={{ padding: 16 }}>
                <p style={{ ...ba(12, 400, { color: text2, marginBottom: 14, lineHeight: 1.6 }) }}>
                    Upload a <code style={{ fontSize: 11, background: bg3, padding: '1px 4px', borderRadius: 3 }}>.json</code> backup file to restore organisation data.
                </p>
                {!file ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setDrag(true); }}
                        onDragLeave={() => setDrag(false)}
                        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                        style={{ borderRadius: 10, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all .15s', border: drag ? `2px dashed ${ORG}` : '2px dashed ' + border, background: drag ? 'rgba(232,98,26,.05)' : bg3 }}
                    >
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 10, background: 'rgba(232,98,26,.12)', color: ORG, marginBottom: 12 }}>
                            <Upload size={20} />
                        </div>
                        <div style={{ ...ba(13, 700, { color: textC, marginBottom: 4 }) }}>Drop file here or click to browse</div>
                        <div style={{ ...ba(11, 400, { color: text2 }) }}>.json backup files only</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, border: '1px solid ' + border, background: bg3 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(74,222,128,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CheckCircle size={16} color="#4ade80" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ ...ba(12, 700, { color: textC }), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                            <div style={{ ...ba(11, 400, { color: text2, marginTop: 1 }) }}>{(file.size / 1024).toFixed(1)} KB · JSON backup</div>
                        </div>
                        <button onClick={() => { setFile(null); setPreview(null); setPreviewError(''); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ ...navBtn(false, false), padding: '4px 10px', fontSize: 11 }}>Remove</button>
                    </div>
                )}
                {previewError && (
                    <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(232,64,64,.1)', color: '#e84040', fontSize: 12 }}>
                        {previewError}
                    </div>
                )}
                <input ref={fileInputRef} type="file" accept=".json" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} style={{ display: 'none' }} />
            </div>
        </div>
    );

    // ─── Import step 3 — preview ───────────────────────

    const renderImportStep3 = () => {
        const entityKeys = preview ? Object.keys(preview.wouldCreate ?? {}) : [];
        const detectedGroups = preview?.detectedGroups ?? [];
        const activeGroups = importGroups ?? detectedGroups;

        return (
            <div style={panel}>
                <div style={panelHead}>{panelTitleWrap('Import Preview', `"${selStrat.label}"`)}</div>

                {/* Group filter chips */}
                {!previewLoading && !previewError && preview && detectedGroups.length > 0 && (
                    <div style={{ padding: '12px 18px', borderBottom: '1px solid ' + border, background: bg3 }}>
                        <div style={{ ...bc(10, 700, { letterSpacing: 1, textTransform: 'uppercase', color: text2, marginBottom: 8 }) }}>
                            Import Groups
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {detectedGroups.map(g => (
                                <button key={g} onClick={() => toggleImportGroup(g)} style={chip(activeGroups.includes(g))}>
                                    {GROUP_LABELS[g] ?? g}
                                </button>
                            ))}
                        </div>
                        {activeGroups.length === 0 && (
                            <p style={{ ...ba(11, 400, { color: '#fbbf24', marginTop: 6 }) }}>Select at least one group to import.</p>
                        )}
                    </div>
                )}

                {previewLoading && <div style={{ padding: '32px 16px', textAlign: 'center', ...ba(12, 400, { color: text2 }) }}>Analysing file…</div>}
                {!previewLoading && previewError && <div style={{ padding: 16, color: '#e84040', fontSize: 12 }}>{previewError}</div>}

                {!previewLoading && !previewError && preview && (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid ' + border, background: bg3 }}>
                                    <th style={{ textAlign: 'left', padding: '9px 18px', whiteSpace: 'nowrap', ...bc(10, 700, { letterSpacing: 1, textTransform: 'uppercase', color: text2 }) }}>Entity</th>
                                    <th style={{ textAlign: 'right', padding: '9px 18px', ...bc(10, 700, { letterSpacing: 1, textTransform: 'uppercase', color: '#4ade80' }) }}>Create</th>
                                    <th style={{ textAlign: 'right', padding: '9px 18px', ...bc(10, 700, { letterSpacing: 1, textTransform: 'uppercase', color: ORG }) }}>Update</th>
                                    <th style={{ textAlign: 'right', padding: '9px 18px', ...bc(10, 700, { letterSpacing: 1, textTransform: 'uppercase', color: '#fbbf24' }) }}>Skip</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entityKeys.map(key => {
                                    const c = preview.wouldCreate?.[key] ?? 0;
                                    const u = preview.wouldUpdate?.[key] ?? 0;
                                    const s = preview.wouldSkip?.[key] ?? 0;
                                    if (c === 0 && u === 0 && s === 0) return null;
                                    return (
                                        <tr key={key} style={{ borderBottom: '1px solid ' + border }}>
                                            <td style={{ padding: '9px 18px', ...ba(12, 600, { color: textC }) }}>{GROUP_LABELS[key] ?? key}</td>
                                            <td style={{ padding: '9px 18px', textAlign: 'right', ...ba(12, 700, { color: c > 0 ? '#4ade80' : text2 }) }}>{c > 0 ? `+${c}` : '—'}</td>
                                            <td style={{ padding: '9px 18px', textAlign: 'right', ...ba(12, 700, { color: u > 0 ? ORG : text2 }) }}>{u > 0 ? `↑${u}` : '—'}</td>
                                            <td style={{ padding: '9px 18px', textAlign: 'right', ...ba(12, 700, { color: s > 0 ? '#fbbf24' : text2 }) }}>{s > 0 ? s : '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {!previewLoading && !previewError && preview?.warnings?.length > 0 && (
                    <div style={{ padding: '10px 18px', borderTop: '1px solid ' + border, background: 'rgba(251,191,36,.08)' }}>
                        <p style={{ ...ba(12, 700, { color: '#fbbf24', marginBottom: 6 }) }}>Warnings</p>
                        {preview.warnings.map((w, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, ...ba(11, 400, { color: '#fbbf24' }) }}>
                                <AlertTriangle size={12} style={{ flexShrink: 0 }} />{w}
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 18px', borderTop: '1px solid ' + border, background: bg3 }}>
                    <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1, color: text2 }} />
                    <p style={{ ...ba(11, 400, { color: text2, lineHeight: 1.5 }) }}>Core data (Admins &amp; Permissions) is always included and cannot be filtered out.</p>
                </div>

                {importError && (
                    <div style={{ padding: '10px 18px', borderTop: '1px solid ' + border, background: 'rgba(232,64,64,.1)', color: '#e84040', fontSize: 12 }}>
                        {importError}
                    </div>
                )}
            </div>
        );
    };

    // ─── Import done ───────────────────────────────────

    const renderImportDone = () => (
        <div>
            <div style={{ ...panel, padding: '48px 24px', textAlign: 'center', marginBottom: results ? 10 : 0 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: '50%', background: 'rgba(74,222,128,.15)', marginBottom: 16 }}>
                    <CheckCircle size={26} color="#4ade80" />
                </div>
                <div style={{ ...bb(20, { color: textC, marginBottom: 6 }) }}>Import complete</div>
                <div style={{ ...ba(12, 400, { color: text2, marginBottom: 20 }) }}>
                    Data restored from "{file?.name}" using "{selStrat.label}"
                </div>
                <button onClick={resetImport} style={navBtn(true, false)}>Import another file</button>
            </div>
            {results && (
                <div style={panel}>
                    <div style={panelHead}>
                        {panelTitleWrap('Results')}
                        <span style={{ ...ba(11, 400, { color: text2 }) }}>
                            {[
                                results.summary?.reduce((a, r) => a + r.created, 0) > 0 && `${results.summary.reduce((a, r) => a + r.created, 0)} created`,
                                results.summary?.reduce((a, r) => a + r.updated, 0) > 0 && `${results.summary.reduce((a, r) => a + r.updated, 0)} updated`,
                                results.summary?.reduce((a, r) => a + r.skipped, 0) > 0 && `${results.summary.reduce((a, r) => a + r.skipped, 0)} skipped`,
                            ].filter(Boolean).join(' · ')}
                        </span>
                    </div>
                    <div style={{ padding: 14 }}>
                        {(results.summary ?? []).map((r, i) => <ResultRow key={i} r={r} />)}
                    </div>
                </div>
            )}
        </div>
    );

    // ─── Render ─────────────────────────────────────────

    return (
        <div style={{ minHeight: '100vh', background: bg, padding: '24px 24px 60px' }}>
            <div>

                {/* Page head */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 18, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(232,98,26,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Database size={20} color={ORG} />
                        </div>
                        <div>
                            <h1 style={{ ...bb(26, { color: textC, margin: 0, lineHeight: 1 }) }}>Data Export &amp; Import</h1>
                            <p style={{ ...ba(12, 400, { color: text2, marginTop: 3 }) }}>Export organisation data for backup or reporting. Import a JSON backup to restore data.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 8, background: bg3, border: '1px solid ' + border, flexShrink: 0 }}>
                        <button
                            onClick={() => setTab('export')}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: isExport ? ORG : 'transparent', color: isExport ? '#fff' : text2 }}
                        >
                            <Download size={13} /> Export
                        </button>
                        <button
                            onClick={() => { setTab('import'); if (!history) loadHistory(); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: !isExport ? ORG : 'transparent', color: !isExport ? '#fff' : text2 }}
                        >
                            <Upload size={13} /> Import
                        </button>
                    </div>
                </div>

                {/* Step wizard */}
                {!isDone && renderWizard(curStep, isExport ? EXPORT_LABELS : IMPORT_LABELS)}

                {/* Tab content */}
                {isExport ? (
                    exportDone   ? renderExportDone()  :
                    exportStep === 1 ? renderExportStep1() :
                    exportStep === 2 ? renderExportStep2() :
                                       renderExportStep3()
                ) : (
                    importDone   ? renderImportDone()  :
                    importStep === 1 ? renderImportStep1() :
                    importStep === 2 ? renderImportStep2() :
                                       renderImportStep3()
                )}

                {/* Nav footer */}
                {!isDone && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                        <button
                            onClick={handleBack}
                            style={{ ...navBtn(false, false), visibility: curStep > 1 ? 'visible' : 'hidden' }}
                        >
                            <ArrowLeft size={13} /> Back
                        </button>
                        <motion.button whileHover={{ scale: nextDisabled ? 1 : 1.02 }} whileTap={{ scale: nextDisabled ? 1 : 0.97 }} onClick={handleNext} disabled={nextDisabled} style={navBtn(true, nextDisabled)}>
                            {(exportLoading || importLoading) && <RefreshCw size={13} className="animate-spin" />}
                            {nextLabel}
                            {curStep < 3 && !exportLoading && !importLoading && <ArrowRight size={13} />}
                        </motion.button>
                    </div>
                )}

                {/* Import History */}
                {!isExport && (
                    <div style={{ ...panel, marginTop: 24 }}>
                        <div style={panelHead}>
                            {panelTitleWrap('Import History')}
                            <button onClick={loadHistory} disabled={historyLoading} style={{ ...navBtn(false, historyLoading), padding: '5px 12px', fontSize: 11 }}>
                                {historyLoading ? <RefreshCw size={12} className="animate-spin" /> : <History size={12} />}
                                {historyLoading ? 'Loading…' : 'Refresh'}
                            </button>
                        </div>
                        {!history && !historyLoading && (
                            <div style={{ padding: '20px 14px', textAlign: 'center', ...ba(12, 400, { color: text2 }) }}>
                                Switch to the Import tab to load history
                            </div>
                        )}
                        {historyLoading && (
                            <div style={{ padding: '20px 14px', textAlign: 'center', ...ba(12, 400, { color: text2 }) }}>Loading…</div>
                        )}
                        {history && history.length === 0 && (
                            <div style={{ padding: '20px 14px', textAlign: 'center', ...ba(12, 400, { color: text2 }) }}>No imports recorded yet.</div>
                        )}
                        {history && history.length > 0 && (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid ' + border, background: bg3 }}>
                                            {['Date', 'File', 'Strategy', 'Created', 'Updated', 'Skipped', 'Status', ''].map(h => (
                                                <th key={h} style={{ textAlign: 'left', padding: '8px 18px', whiteSpace: 'nowrap', ...bc(10, 700, { letterSpacing: 1, textTransform: 'uppercase', color: text2 }) }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map(snap => {
                                            const summaryArr = Array.isArray(snap.summary) ? snap.summary : [];
                                            const created = summaryArr.reduce((a, r) => a + (r.created ?? 0), 0);
                                            const updated = summaryArr.reduce((a, r) => a + (r.updated ?? 0), 0);
                                            const skipped = summaryArr.reduce((a, r) => a + (r.skipped ?? 0), 0);
                                            return (
                                                <tr key={snap.id} style={{ borderBottom: '1px solid ' + border, opacity: snap.status === 'rolled_back' ? 0.55 : 1 }}>
                                                    <td style={{ padding: '9px 18px', whiteSpace: 'nowrap', ...ba(11, 400, { color: text2 }) }}>
                                                        {new Date(snap.createdAt).toLocaleString()}
                                                    </td>
                                                    <td style={{ padding: '9px 18px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...ba(11, 400, { color: textC }) }} title={snap.fileName}>
                                                        {snap.fileName}
                                                    </td>
                                                    <td style={{ padding: '9px 18px', ...ba(11, 400, { color: text2 }) }}>{snap.strategy}</td>
                                                    <td style={{ padding: '9px 18px', ...ba(11, 700, { color: '#4ade80' }) }}>
                                                        {created > 0 ? `+${created}` : '—'}
                                                    </td>
                                                    <td style={{ padding: '9px 18px', ...ba(11, 700, { color: ORG }) }}>
                                                        {updated > 0 ? `↑${updated}` : '—'}
                                                    </td>
                                                    <td style={{ padding: '9px 18px', ...ba(11, 400, { color: text2 }) }}>
                                                        {skipped > 0 ? skipped : '—'}
                                                    </td>
                                                    <td style={{ padding: '9px 18px' }}>
                                                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: snap.status === 'rolled_back' ? bg3 : 'rgba(74,222,128,.15)', color: snap.status === 'rolled_back' ? text2 : '#4ade80' }}>
                                                            {snap.status === 'rolled_back' ? 'Rolled back' : 'Active'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '9px 18px' }}>
                                                        {snap.status === 'active' && created > 0 && (
                                                            <button onClick={() => { setRollbackTarget(snap); setRollbackError(''); }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', fontSize: 11, fontWeight: 700, background: 'rgba(232,64,64,.1)', color: '#e84040', border: '1px solid rgba(232,64,64,.3)', borderRadius: 6, cursor: 'pointer' }}>
                                                                Rollback
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

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
                        onClick={() => !rollbackLoading && setRollbackTarget(null)}>
                        <motion.div initial={{ scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .92, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ background: bg2, border: '1px solid rgba(232,64,64,.4)', borderRadius: 10, padding: 28, maxWidth: 440, width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <AlertTriangle size={22} color="#e84040" />
                                <h3 style={{ ...ba(17, 700, { color: textC, margin: 0 }) }}>Rollback this import?</h3>
                            </div>
                            <p style={{ ...ba(13, 400, { color: text2, marginBottom: 12, lineHeight: 1.6 }) }}>
                                This will permanently delete the records created by the import of <strong style={{ color: textC }}>"{rollbackTarget.fileName}"</strong> on {new Date(rollbackTarget.createdAt).toLocaleString()}.
                                Records that were <em>updated</em> (not created) are not reverted.
                            </p>
                            {rollbackError && (
                                <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(232,64,64,.1)', color: '#e84040', fontSize: 12 }}>{rollbackError}</div>
                            )}
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                <button onClick={() => setRollbackTarget(null)} disabled={rollbackLoading} style={navBtn(false, rollbackLoading)}>Cancel</button>
                                <button onClick={confirmRollback} disabled={rollbackLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 13, fontWeight: 700, background: '#e84040', color: '#fff', border: 'none', borderRadius: 6, cursor: rollbackLoading ? 'not-allowed' : 'pointer', opacity: rollbackLoading ? 0.6 : 1 }}>
                                    {rollbackLoading ? <RefreshCw size={14} className="animate-spin" /> : null}
                                    {rollbackLoading ? 'Rolling back…' : 'Yes, rollback'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
