import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Lock, LockKeyhole, Unlock, ShieldCheck, ShieldAlert, KeyRound, Code2, StickyNote, Fingerprint,
    Plus, Search, Eye, EyeOff, Copy, Pencil, Trash2, X, Wand2, ExternalLink, Loader2, Settings, Check,
    AlertCircle, CheckCircle, XCircle, Grid3X3, List, Table, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import vaultService from '../../services/vaultService';
import {
    createVault, deriveUnlockKeys, openDek, rewrapForNewPassword, encryptItem, decryptItem,
    generatePassword, passwordStrength, MIN_MASTER_LENGTH,
} from '../../utils/vaultCrypto';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';

// ─── Constants ────────────────────────────────────────

const IDLE_LOCK_MS = 5 * 60 * 1000;
const CLIPBOARD_CLEAR_MS = 30 * 1000;

const ITEM_TYPES = [
    { id: 'password', label: 'Passwords',       Icon: KeyRound },
    { id: 'api_key',  label: 'API / Secret Keys', Icon: Code2 },
    { id: 'secret',   label: 'Other Secrets', Icon: Fingerprint },
    { id: 'note',     label: 'Secure Notes', Icon: StickyNote },
];
const typeMeta = (id) => ITEM_TYPES.find((t) => t.id === id) || ITEM_TYPES[0];

const EMPTY_ITEM = { type: 'password', title: '', username: '', secret: '', url: '', notes: '' };
const STRENGTH_COLORS = ['#e84040', '#f97316', '#fbbf24', '#4ade80', '#22c55e'];

// ─── Small building blocks (restyled to match Employee Management) ──

const labelStyle = (theme) => bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: theme.text2 });

function Field({ theme, label, children, hint }) {
    return (
        <label style={{ display: 'block', marginBottom: 14 }}>
            <span style={labelStyle(theme)}>{label}</span>
            <div style={{ marginTop: 6 }}>{children}</div>
            {hint && <span style={ba(11, 400, { color: theme.text2, display: 'block', marginTop: 4 })}>{hint}</span>}
        </label>
    );
}

const inputStyle = (theme) => ({
    width: '100%', padding: '8px 12px', borderRadius: 4, outline: 'none',
    border: `1px solid ${theme.border}`, background: theme.bg3, color: theme.textC,
    ...ba(13),
});

function PasswordInput({ theme, value, onChange, placeholder, autoFocus, autoComplete = 'off', mono }) {
    const [show, setShow] = useState(false);
    return (
        <div style={{ position: 'relative' }}>
            <input
                type={show ? 'text' : 'password'} value={value} placeholder={placeholder} autoFocus={autoFocus}
                autoComplete={autoComplete} spellCheck={false}
                onChange={(e) => onChange(e.target.value)}
                style={{ ...inputStyle(theme), paddingRight: 40, fontFamily: mono ? 'monospace' : inputStyle(theme).fontFamily }}
            />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide' : 'Show'}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: theme.text2, display: 'flex' }}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
        </div>
    );
}

function StrengthMeter({ theme, password }) {
    const { score, label, bits } = passwordStrength(password);
    if (!password) return null;
    return (
        <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? STRENGTH_COLORS[score] : theme.bg3 }} />
                ))}
            </div>
            <span style={ba(11, 600, { color: STRENGTH_COLORS[score] })}>{label} · ~{bits} bits</span>
        </div>
    );
}

function Button({ theme, children, onClick, variant = 'primary', disabled, type = 'button', style }) {
    const variants = {
        primary: { background: ORG, color: '#fff', border: `1px solid ${ORG}` },
        ghost:   { background: theme.bg3, color: theme.textC, border: `1px solid ${theme.border}` },
        danger:  { background: '#e84040', color: '#fff', border: '1px solid #e84040' },
    };
    return (
        <motion.button whileHover={{ scale: disabled ? 1 : 1.03 }} type={type} onClick={onClick} disabled={disabled}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 14px', borderRadius: 4,
                cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, fontSize: 12, fontWeight: 600, ...variants[variant], ...style }}>
            {children}
        </motion.button>
    );
}

function Modal({ theme, title, subtitle, onClose, children, width = 480 }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
            style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
                style={{ width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 4 }}>
                <div style={{ padding: '16px 24px', background: theme.bg3, borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: theme.textC }}>{title}</h3>
                        {subtitle && <p style={{ fontSize: 12, color: theme.text2, marginTop: 2 }}>{subtitle}</p>}
                    </div>
                    <button onClick={onClose} style={{ padding: 8, borderRadius: 4, background: theme.bg2, border: `1px solid ${theme.border}`, color: theme.textC, cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Close">
                        <X size={16} />
                    </button>
                </div>
                <div style={{ padding: 24 }}>{children}</div>
            </motion.div>
        </motion.div>
    );
}

function ErrorText({ children }) {
    if (!children) return null;
    return (
        <div style={{ background: 'rgba(232,64,64,.1)', border: '1px solid rgba(232,64,64,.3)', borderRadius: 4, padding: '10px 12px', color: '#e84040', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{children}</span>
        </div>
    );
}

const TypeBadge = ({ type }) => {
    const { label } = typeMeta(type);
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: 'rgba(26,92,120,.15)', color: TEAL }}>
            {label.replace(/s$/, '')}
        </span>
    );
};

// ─── Generator ───────────────────────────────────────

function GeneratorPanel({ theme, onUse }) {
    const [opts, setOpts] = useState({ length: 24, lower: true, upper: true, digits: true, symbols: true });
    const [value, setValue] = useState(() => generatePassword(opts));
    const regen = (next = opts) => setValue(generatePassword(next));
    const toggle = (k) => { const next = { ...opts, [k]: !opts[k] }; setOpts(next); regen(next); };

    return (
        <div style={{ border: `1px solid ${theme.border}`, borderRadius: 4, padding: 12, marginBottom: 14, background: theme.bg3 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <code style={{ flex: 1, wordBreak: 'break-all', fontSize: 13, color: theme.textC }}>{value}</code>
                <Button theme={theme} variant="ghost" onClick={() => regen()} style={{ padding: '6px 10px' }}>New</Button>
                <Button theme={theme} onClick={() => onUse(value)} style={{ padding: '6px 10px' }}>Use</Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10, alignItems: 'center' }}>
                <span style={ba(12, 600, { color: theme.text2 })}>Length {opts.length}</span>
                <input type="range" min={12} max={64} value={opts.length}
                    onChange={(e) => { const next = { ...opts, length: Number(e.target.value) }; setOpts(next); regen(next); }} />
                {['lower', 'upper', 'digits', 'symbols'].map((k) => (
                    <label key={k} style={ba(12, 600, { color: theme.text2, display: 'flex', gap: 4, alignItems: 'center', cursor: 'pointer' })}>
                        <input type="checkbox" checked={opts[k]} onChange={() => toggle(k)} /> {k}
                    </label>
                ))}
            </div>
        </div>
    );
}

// ─── Item editor ─────────────────────────────────────

function ItemModal({ theme, initial, onClose, onSave }) {
    const [form, setForm] = useState(initial || EMPTY_ITEM);
    const [showGen, setShowGen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const set = (k) => (v) => setForm((f) => ({ ...f, [k]: typeof v === 'string' ? v : v.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return setError('Title is required');
        if (form.type !== 'note' && !form.secret) return setError('Secret is required');
        setSaving(true);
        setError('');
        try {
            await onSave({ ...form, title: form.title.trim() });
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    return (
        <Modal theme={theme} title={initial ? 'Edit Item' : 'New Item'} subtitle="Encrypted in your browser before it ever leaves this device" onClose={onClose}>
            <form onSubmit={submit}>
                <Field theme={theme} label="Type">
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {ITEM_TYPES.map(({ id, label, Icon }) => (
                            <button key={id} type="button" onClick={() => setForm((f) => ({ ...f, type: id }))}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 4, cursor: 'pointer',
                                    border: `1px solid ${form.type === id ? ORG : theme.border}`, background: form.type === id ? ORG : theme.bg3,
                                    color: form.type === id ? '#fff' : theme.textC, ...bc(12, 700) }}>
                                <Icon size={14} /> {label.replace(/s$/, '')}
                            </button>
                        ))}
                    </div>
                </Field>
                <Field theme={theme} label="Title">
                    <input value={form.title} onChange={set('title')} placeholder="e.g. AWS root account" style={inputStyle(theme)} autoFocus />
                </Field>
                {form.type !== 'note' && (
                    <>
                        <Field theme={theme} label={form.type === 'api_key' ? 'Key name / account' : 'Username / email'}>
                            <input value={form.username} onChange={set('username')} style={inputStyle(theme)} autoComplete="off" />
                        </Field>
                        <Field theme={theme} label={form.type === 'password' ? 'Password' : 'Secret value'}>
                            <PasswordInput theme={theme} value={form.secret} onChange={set('secret')} mono />
                            {form.type === 'password' && <StrengthMeter theme={theme} password={form.secret} />}
                            <button type="button" onClick={() => setShowGen((s) => !s)}
                                style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', color: ORG, display: 'flex', alignItems: 'center', gap: 4, ...bc(13, 700) }}>
                                <Wand2 size={14} /> {showGen ? 'Hide generator' : 'Generate strong value'}
                            </button>
                        </Field>
                        {showGen && <GeneratorPanel theme={theme} onUse={(v) => { setForm((f) => ({ ...f, secret: v })); setShowGen(false); }} />}
                        <Field theme={theme} label="Website / service URL">
                            <input value={form.url} onChange={set('url')} placeholder="https://" style={inputStyle(theme)} />
                        </Field>
                    </>
                )}
                <Field theme={theme} label="Notes">
                    <textarea value={form.notes} onChange={set('notes')} rows={form.type === 'note' ? 8 : 3} style={{ ...inputStyle(theme), resize: 'vertical' }} />
                </Field>
                <ErrorText>{error}</ErrorText>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button theme={theme} variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button theme={theme} type="submit" disabled={saving}>
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} Encrypt &amp; Save
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

// ─── Shared item pieces (avatar + secret reveal, used by all view modes) ──

const ItemAvatar = ({ type, size = 'md' }) => {
    const { Icon } = typeMeta(type);
    const sizePx = size === 'sm' ? 32 : size === 'lg' ? 48 : 40;
    const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 18;
    return (
        <div style={{ width: sizePx, height: sizePx, borderRadius: '50%', background: ORG, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={iconSize} />
        </div>
    );
};

function SecretReveal({ theme, item, onCopy, copiedKey, compact }) {
    const [reveal, setReveal] = useState(false);
    const d = item.data;
    const copyKey = `${item.id}:secret`;
    return (
        <div className="flex items-center gap-2" style={compact ? { minWidth: 160 } : undefined}>
            <code style={{ flex: 1, padding: '6px 10px', borderRadius: 4, background: theme.bg3, color: theme.textC, fontSize: 12, wordBreak: 'break-all', border: `1px solid ${theme.border}` }}>
                {reveal ? d.secret : '•'.repeat(Math.min(d.secret.length || 12, 24))}
            </code>
            <button onClick={() => setReveal((r) => !r)} title={reveal ? 'Hide' : 'Reveal'}
                style={{ padding: 6, borderRadius: 4, background: theme.bg3, border: `1px solid ${theme.border}`, color: theme.textC, cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                {reveal ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button onClick={() => onCopy(d.secret, copyKey)} title="Copy secret (clipboard clears in 30s)"
                style={{ padding: 6, borderRadius: 4, background: copiedKey === copyKey ? 'rgba(74,222,128,.15)' : theme.bg3, border: `1px solid ${copiedKey === copyKey ? 'rgba(74,222,128,.3)' : theme.border}`, color: copiedKey === copyKey ? '#4ade80' : theme.textC, cursor: 'pointer', display: 'flex', flexShrink: 0 }}>
                {copiedKey === copyKey ? <Check size={14} /> : <Copy size={14} />}
            </button>
        </div>
    );
}

function ItemActions({ theme, item, onCopy, onEdit, onDelete, copiedKey }) {
    const d = item.data;
    return (
        <div className="flex items-center justify-end space-x-1">
            {d.username && (
                <button onClick={() => onCopy(d.username, `${item.id}:user`)} title="Copy username"
                    style={{ padding: 6, borderRadius: 4, background: theme.bg3, border: `1px solid ${theme.border}`, color: theme.textC, cursor: 'pointer', display: 'flex' }}>
                    {copiedKey === `${item.id}:user` ? <Check size={14} /> : <Copy size={14} />}
                </button>
            )}
            {/^https?:\/\//i.test(d.url || '') && (
                <a href={d.url} target="_blank" rel="noopener noreferrer" title="Open site"
                    style={{ padding: 6, borderRadius: 4, background: theme.bg3, border: `1px solid ${theme.border}`, color: theme.textC, display: 'flex' }}>
                    <ExternalLink size={14} />
                </a>
            )}
            <button onClick={onEdit} disabled={item.broken} title="Edit"
                style={{ padding: 6, borderRadius: 4, background: theme.bg3, border: `1px solid ${theme.border}`, color: theme.textC, cursor: item.broken ? 'not-allowed' : 'pointer', opacity: item.broken ? 0.5 : 1, display: 'flex' }}>
                <Pencil size={14} />
            </button>
            <button onClick={onDelete} title="Delete"
                style={{ padding: 6, borderRadius: 4, background: 'rgba(232,64,64,.1)', border: '1px solid rgba(232,64,64,.3)', color: '#e84040', cursor: 'pointer', display: 'flex' }}>
                <Trash2 size={14} />
            </button>
        </div>
    );
}

// ─── Item card (restyled like Employee Management's grid card) ──

function ItemCard({ theme, item, onCopy, onEdit, onDelete, copiedKey }) {
    const [reveal, setReveal] = useState(false);
    const { Icon } = typeMeta(item.data.type);
    const d = item.data;
    const safeUrl = /^https?:\/\//i.test(d.url || '') ? d.url : null;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 4, padding: 16 }}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: ORG, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: theme.textC }} className="truncate">{d.title}</h3>
                        <p style={{ fontSize: 12, color: theme.text2 }} className="truncate">{d.username || '—'}</p>
                    </div>
                </div>
                <TypeBadge type={d.type} />
            </div>

            {d.type !== 'note' && (
                <div className="flex items-center gap-2 mb-3">
                    <code style={{ flex: 1, padding: '8px 10px', borderRadius: 4, background: theme.bg3, color: theme.textC, fontSize: 12, wordBreak: 'break-all', border: `1px solid ${theme.border}` }}>
                        {reveal ? d.secret : '•'.repeat(Math.min(d.secret.length || 12, 24))}
                    </code>
                    <button onClick={() => setReveal((r) => !r)} title={reveal ? 'Hide' : 'Reveal'}
                        style={{ padding: 6, borderRadius: 4, background: theme.bg3, border: `1px solid ${theme.border}`, color: theme.textC, cursor: 'pointer', display: 'flex' }}>
                        {reveal ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={() => onCopy(d.secret, `${item.id}:secret`)} title="Copy secret (clipboard clears in 30s)"
                        style={{ padding: 6, borderRadius: 4, background: copiedKey === `${item.id}:secret` ? 'rgba(74,222,128,.15)' : theme.bg3, border: `1px solid ${copiedKey === `${item.id}:secret` ? 'rgba(74,222,128,.3)' : theme.border}`, color: copiedKey === `${item.id}:secret` ? '#4ade80' : theme.textC, cursor: 'pointer', display: 'flex' }}>
                        {copiedKey === `${item.id}:secret` ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </div>
            )}
            {d.notes && (
                <p style={ba(12, 400, { color: theme.text2, marginBottom: 10, whiteSpace: 'pre-wrap', wordBreak: 'break-word' })}>
                    {d.type === 'note' && !reveal ? (
                        <button onClick={() => setReveal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: ORG, padding: 0, ...bc(13, 700) }}>Show note</button>
                    ) : d.notes}
                </p>
            )}

            <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
                {safeUrl ? (
                    <a href={safeUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: theme.text2, fontSize: 12 }}>
                        <ExternalLink size={13} /> Open site
                    </a>
                ) : <span />}
                <div className="flex items-center space-x-1">
                    {d.username && (
                        <button onClick={() => onCopy(d.username, `${item.id}:user`)} title="Copy username"
                            style={{ padding: 6, borderRadius: 4, background: theme.bg3, border: `1px solid ${theme.border}`, color: theme.textC, cursor: 'pointer', display: 'flex' }}>
                            {copiedKey === `${item.id}:user` ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    )}
                    <button onClick={onEdit} disabled={item.broken} title="Edit"
                        style={{ padding: 6, borderRadius: 4, background: theme.bg3, border: `1px solid ${theme.border}`, color: theme.textC, cursor: item.broken ? 'not-allowed' : 'pointer', opacity: item.broken ? 0.5 : 1, display: 'flex' }}>
                        <Pencil size={14} />
                    </button>
                    <button onClick={onDelete} title="Delete"
                        style={{ padding: 6, borderRadius: 4, background: 'rgba(232,64,64,.1)', border: '1px solid rgba(232,64,64,.3)', color: '#e84040', cursor: 'pointer', display: 'flex' }}>
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Gate screens (setup / unlock) ───────────────────

function GateCard({ theme, icon: Icon, title, subtitle, children }) {
    return (
        <div style={{ maxWidth: 460, margin: '40px auto', border: `1px solid ${theme.border}`, borderRadius: 4, padding: 28, background: theme.bg2 }}>
            <div style={{ width: 48, height: 48, borderRadius: 6, background: 'rgba(232,98,26,.15)', color: ORG, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon size={24} />
            </div>
            <h2 style={bb(28, { color: ORG, letterSpacing: 1 })}>{title}</h2>
            <p style={ba(13, 400, { color: theme.text2, margin: '6px 0 20px' })}>{subtitle}</p>
            {children}
        </div>
    );
}

function SetupScreen({ theme, onCreated }) {
    const [pw, setPw] = useState('');
    const [confirm, setConfirm] = useState('');
    const [ack, setAck] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const strength = passwordStrength(pw);

    const submit = async (e) => {
        e.preventDefault();
        if (pw.length < MIN_MASTER_LENGTH) return setError(`Use at least ${MIN_MASTER_LENGTH} characters`);
        if (strength.score < 2) return setError('Master password is too weak — add length or variety');
        if (pw !== confirm) return setError('Passwords do not match');
        if (!ack) return setError('Please confirm you understand the password cannot be recovered');
        setBusy(true);
        setError('');
        try {
            const { setup, dek, encryptedDek } = await createVault(pw);
            await vaultService.setup(setup);
            onCreated({ dek, encryptedDek, status: { exists: true, kdfSalt: setup.kdfSalt, kdfParams: setup.kdfParams } });
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    };

    return (
        <GateCard theme={theme} icon={ShieldCheck} title="Create Your Password Locker"
            subtitle="Pick a master password. It encrypts everything in your browser before it is sent — we never see it.">
            <form onSubmit={submit}>
                <Field theme={theme} label="Master password">
                    <PasswordInput theme={theme} value={pw} onChange={setPw} autoFocus autoComplete="new-password" />
                    <StrengthMeter theme={theme} password={pw} />
                </Field>
                <Field theme={theme} label="Confirm master password">
                    <PasswordInput theme={theme} value={confirm} onChange={setConfirm} autoComplete="new-password" />
                </Field>
                <label style={ba(13, 500, { color: theme.text2, display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 14, cursor: 'pointer' })}>
                    <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} style={{ marginTop: 3 }} />
                    I understand that if I forget this master password, nobody — not even AbyTech admins — can recover my items.
                </label>
                <ErrorText>{error}</ErrorText>
                <Button theme={theme} type="submit" disabled={busy} style={{ width: '100%' }}>
                    {busy ? <><Loader2 size={14} className="animate-spin" /> Deriving keys…</> : <><LockKeyhole size={14} /> Create Locker</>}
                </Button>
            </form>
        </GateCard>
    );
}

function UnlockScreen({ theme, status, onUnlocked, onDestroyed }) {
    const [pw, setPw] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [lockedUntil, setLockedUntil] = useState(status.lockedUntil ? new Date(status.lockedUntil) : null);
    const [showReset, setShowReset] = useState(false);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        if (!lockedUntil) return undefined;
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, [lockedUntil]);
    const lockedOut = lockedUntil && lockedUntil.getTime() > now;

    const submit = async (e) => {
        e.preventDefault();
        if (!pw || lockedOut) return;
        setBusy(true);
        setError('');
        try {
            const { kek, authKey } = await deriveUnlockKeys(pw, status);
            const { encryptedDek } = await vaultService.unlock(authKey);
            const dek = await openDek(kek, encryptedDek);
            setPw('');
            onUnlocked({ dek, encryptedDek });
        } catch (err) {
            if (err.lockedUntil) setLockedUntil(new Date(err.lockedUntil));
            setError(err.attemptsLeft !== undefined ? `${err.message} — ${err.attemptsLeft} attempt(s) left before lockout` : err.message);
            setBusy(false);
        }
    };

    const mins = lockedOut ? Math.ceil((lockedUntil.getTime() - now) / 60000) : 0;

    return (
        <GateCard theme={theme} icon={Lock} title="Locker Is Locked" subtitle="Enter your master password to decrypt your items on this device.">
            <form onSubmit={submit}>
                <Field theme={theme} label="Master password">
                    <PasswordInput theme={theme} value={pw} onChange={setPw} autoFocus autoComplete="current-password" />
                </Field>
                {lockedOut && (
                    <p style={ba(13, 600, { color: '#fbbf24', marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center' })}>
                        <ShieldAlert size={15} /> Too many failed attempts. Try again in ~{mins} min.
                    </p>
                )}
                <ErrorText>{!lockedOut && error}</ErrorText>
                <Button theme={theme} type="submit" disabled={busy || lockedOut || !pw} style={{ width: '100%' }}>
                    {busy ? <><Loader2 size={14} className="animate-spin" /> Decrypting…</> : <><Unlock size={14} /> Unlock</>}
                </Button>
            </form>
            <button onClick={() => setShowReset(true)}
                style={{ marginTop: 16, background: 'none', border: 'none', cursor: 'pointer', color: theme.text2, ...ba(12, 500), textDecoration: 'underline' }}>
                Forgot master password?
            </button>
            <AnimatePresence>
                {showReset && <ResetModal theme={theme} onClose={() => setShowReset(false)} onDone={onDestroyed} />}
            </AnimatePresence>
        </GateCard>
    );
}

function ResetModal({ theme, onClose, onDone }) {
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const go = async () => {
        setBusy(true);
        try {
            await vaultService.destroy(text);
            onDone();
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    };
    return (
        <Modal theme={theme} title="Delete Locker" onClose={onClose} width={440}>
            <p style={ba(13, 400, { color: theme.text2, marginBottom: 14 })}>
                Your items are encrypted with your master password, so they cannot be recovered without it.
                The only option is to permanently delete the locker and start again.
            </p>
            <Field theme={theme} label='Type "DELETE MY VAULT" to confirm'>
                <input value={text} onChange={(e) => setText(e.target.value)} style={inputStyle(theme)} />
            </Field>
            <ErrorText>{error}</ErrorText>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button theme={theme} variant="ghost" onClick={onClose}>Cancel</Button>
                <Button theme={theme} variant="danger" disabled={busy || text !== 'DELETE MY VAULT'} onClick={go}><Trash2 size={14} /> Delete Forever</Button>
            </div>
        </Modal>
    );
}

function ChangeMasterModal({ theme, status, encryptedDek, onClose, onChanged }) {
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [confirm, setConfirm] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        if (next.length < MIN_MASTER_LENGTH) return setError(`Use at least ${MIN_MASTER_LENGTH} characters`);
        if (passwordStrength(next).score < 2) return setError('New master password is too weak');
        if (next !== confirm) return setError('New passwords do not match');
        setBusy(true);
        setError('');
        try {
            const result = await rewrapForNewPassword(current, next, status, encryptedDek);
            await vaultService.changeMaster(result.body);
            onChanged(result);
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    };

    return (
        <Modal theme={theme} title="Change Master Password" onClose={onClose} width={460}>
            <form onSubmit={submit}>
                <Field theme={theme} label="Current master password">
                    <PasswordInput theme={theme} value={current} onChange={setCurrent} autoFocus autoComplete="current-password" />
                </Field>
                <Field theme={theme} label="New master password">
                    <PasswordInput theme={theme} value={next} onChange={setNext} autoComplete="new-password" />
                    <StrengthMeter theme={theme} password={next} />
                </Field>
                <Field theme={theme} label="Confirm new master password">
                    <PasswordInput theme={theme} value={confirm} onChange={setConfirm} autoComplete="new-password" />
                </Field>
                <ErrorText>{error}</ErrorText>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button theme={theme} variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button theme={theme} type="submit" disabled={busy}>
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />} Change
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

// ─── Delete item confirmation (matching Employee Management's delete modal) ──

function DeleteItemModal({ theme, item, busy, onCancel, onConfirm }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
                style={{ width: '100%', maxWidth: 420, background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ padding: 24, textAlign: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(232,64,64,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <AlertCircle className="w-6 h-6" style={{ color: '#e84040' }} />
                    </div>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: theme.textC, marginBottom: 8 }}>Delete Item</h2>
                    <p style={{ fontSize: 13, color: theme.text2 }}>
                        Are you sure you want to delete <strong style={{ color: theme.textC }}>{item.data.title}</strong>? This action cannot be undone.
                    </p>
                </div>
                <div className="flex items-center justify-center gap-3 pb-6 px-6">
                    <button type="button" onClick={onCancel} disabled={busy}
                        style={{ flex: 1, padding: '10px 16px', fontSize: 13, fontWeight: 600, background: theme.bg3, border: `1px solid ${theme.border}`, color: theme.textC, borderRadius: 4, cursor: busy ? 'not-allowed' : 'pointer' }}>
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} disabled={busy}
                        style={{ flex: 1, padding: '10px 16px', fontSize: 13, fontWeight: 600, background: '#e84040', border: '1px solid #e84040', color: '#fff', borderRadius: 4, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1 }}>
                        {busy ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Page ────────────────────────────────────────────

export default function PasswordVaultPage() {
    const theme = useDashboardTheme();
    const { bg, bg2, bg3, textC, text2, text3, border } = theme;

    const [phase, setPhase] = useState('loading'); // loading | setup | locked | unlocked | error
    const [status, setStatus] = useState(null);
    const [items, setItems] = useState([]);
    const [loadError, setLoadError] = useState('');
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [viewMode, setViewMode] = useState('table'); // table | grid | list
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [editing, setEditing] = useState(null); // null | 'new' | item
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteBusy, setDeleteBusy] = useState(false);
    const [showChangeMaster, setShowChangeMaster] = useState(false);
    const [copiedKey, setCopiedKey] = useState(null);
    const [operationStatus, setOperationStatus] = useState(null);

    // Keys live only in memory (never state, storage or the network).
    const dekRef = useRef(null);
    const encryptedDekRef = useRef(null);
    const clipboardTimer = useRef(null);

    const showOperationStatus = useCallback((type, message, duration = 3000) => {
        setOperationStatus({ type, message });
        window.setTimeout(() => setOperationStatus(null), duration);
    }, []);

    const loadStatus = useCallback(async () => {
        setPhase('loading');
        try {
            const s = await vaultService.getStatus();
            setStatus(s);
            setPhase(s.exists ? 'locked' : 'setup');
        } catch (err) {
            setLoadError(err.message);
            setPhase('error');
        }
    }, []);

    useEffect(() => { loadStatus(); }, [loadStatus]);

    const lockLocal = useCallback(() => {
        dekRef.current = null;
        encryptedDekRef.current = null;
        setItems([]);
        setEditing(null);
        setShowChangeMaster(false);
        setQuery('');
        setTypeFilter('all');
    }, []);

    const lock = useCallback(async () => {
        lockLocal();
        vaultService.lock().catch(() => {});
        await loadStatus();
    }, [lockLocal, loadStatus]);

    // Any 401 from an item call means the server-side session is gone.
    const guard = useCallback(async (fn) => {
        try {
            return await fn();
        } catch (err) {
            if (err.status === 401) await lock();
            throw err;
        }
    }, [lock]);

    const loadItems = useCallback(async () => {
        const rows = await guard(() => vaultService.listItems());
        const decrypted = await Promise.all(rows.map(async (row) => {
            try {
                return { id: row.id, updatedAt: row.updatedAt, data: await decryptItem(dekRef.current, row.payload) };
            } catch {
                return { id: row.id, updatedAt: row.updatedAt, data: { ...EMPTY_ITEM, title: '⚠ Unreadable item (integrity check failed)', type: 'secret' }, broken: true };
            }
        }));
        setItems(decrypted);
    }, [guard]);

    const onUnlocked = useCallback(async ({ dek, encryptedDek, status: newStatus }) => {
        dekRef.current = dek;
        encryptedDekRef.current = encryptedDek;
        if (newStatus) setStatus(newStatus);
        setPhase('unlocked');
        try { await loadItems(); } catch (err) { setLoadError(err.message); }
    }, [loadItems]);

    // Auto-lock after inactivity and when leaving the page.
    useEffect(() => {
        if (phase !== 'unlocked') return undefined;
        let timer = setTimeout(lock, IDLE_LOCK_MS);
        const reset = () => { clearTimeout(timer); timer = setTimeout(lock, IDLE_LOCK_MS); };
        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
        events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
        return () => {
            clearTimeout(timer);
            events.forEach((e) => window.removeEventListener(e, reset));
        };
    }, [phase, lock]);

    useEffect(() => () => {
        // Unmount (navigating away): drop keys and revoke the server session.
        if (dekRef.current) vaultService.lock().catch(() => {});
        dekRef.current = null;
        clearTimeout(clipboardTimer.current);
    }, []);

    const copy = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
            clearTimeout(clipboardTimer.current);
            clipboardTimer.current = setTimeout(() => navigator.clipboard.writeText('').catch(() => {}), CLIPBOARD_CLEAR_MS);
        } catch {
            showOperationStatus('error', 'Clipboard is not available in this browser');
        }
    };

    const saveItem = async (data) => {
        const payload = await encryptItem(dekRef.current, data);
        if (editing === 'new') {
            const row = await guard(() => vaultService.createItem(payload));
            setItems((prev) => [{ id: row.id, updatedAt: row.updatedAt, data }, ...prev]);
        } else {
            const row = await guard(() => vaultService.updateItem(editing.id, payload));
            setItems((prev) => [{ id: row.id, updatedAt: row.updatedAt, data }, ...prev.filter((i) => i.id !== row.id)]);
        }
        setEditing(null);
        showOperationStatus('success', 'Item saved successfully');
    };

    const confirmDeleteItem = async () => {
        if (!deleteTarget) return;
        try {
            setDeleteBusy(true);
            await guard(() => vaultService.deleteItem(deleteTarget.id));
            setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
            showOperationStatus('success', 'Item deleted successfully');
            setDeleteTarget(null);
        } catch (err) {
            showOperationStatus('error', err.message || 'Failed to delete item');
        } finally {
            setDeleteBusy(false);
        }
    };

    const typeCounts = useMemo(() => {
        const counts = { all: items.length };
        ITEM_TYPES.forEach(({ id }) => { counts[id] = items.filter((i) => i.data.type === id).length; });
        return counts;
    }, [items]);

    const filterCards = [
        { key: 'all', label: 'All Items', Icon: LockKeyhole, count: typeCounts.all },
        ...ITEM_TYPES.map((t) => ({ key: t.id, label: t.label, Icon: t.Icon, count: typeCounts[t.id] })),
    ];

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return items.filter((i) => (typeFilter === 'all' || i.data.type === typeFilter)
            && (!q || [i.data.title, i.data.username, i.data.url].some((v) => v?.toLowerCase().includes(q))));
    }, [items, query, typeFilter]);

    const totalPages = Math.max(1, Math.ceil(visible.length / itemsPerPage));
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const pageItems = visible.slice(startIdx, endIdx);

    useEffect(() => {
        setCurrentPage(1);
    }, [visible.length, typeFilter, query]);

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const renderGrid = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pageItems.map((item) => (
                <ItemCard key={item.id} theme={theme} item={item} copiedKey={copiedKey}
                    onCopy={copy} onEdit={() => !item.broken && setEditing(item)} onDelete={() => setDeleteTarget(item)} />
            ))}
        </div>
    );

    const renderTable = () => (
        <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, overflow: 'hidden' }}>
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead style={{ background: bg3 }}>
                        <tr>
                            <th className="text-left py-2 px-3" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Item</th>
                            <th className="text-left py-2 px-3 hidden md:table-cell" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Type</th>
                            <th className="text-left py-2 px-3 hidden lg:table-cell" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Username</th>
                            <th className="text-left py-2 px-3 hidden xl:table-cell" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Secret</th>
                            <th className="text-left py-2 px-3 hidden xl:table-cell" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Updated</th>
                            <th className="text-right py-2 px-3" style={bc(10, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageItems.map((item) => (
                            <motion.tr
                                key={item.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ background: bg2, borderBottom: `1px solid ${border}` }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = bg3)}
                                onMouseLeave={(e) => (e.currentTarget.style.background = bg2)}
                            >
                                <td className="py-2 px-3">
                                    <div className="flex items-center space-x-2">
                                        <ItemAvatar type={item.data.type} size="sm" />
                                        <div>
                                            <div style={{ fontWeight: 600, color: textC }}>{item.data.title}</div>
                                            <div style={{ fontSize: 11, color: text2 }} className="lg:hidden">{item.data.username || '—'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-2 px-3 hidden md:table-cell"><TypeBadge type={item.data.type} /></td>
                                <td className="py-2 px-3 hidden lg:table-cell" style={{ color: text2 }}>{item.data.username || '—'}</td>
                                <td className="py-2 px-3 hidden xl:table-cell">
                                    {item.data.type !== 'note'
                                        ? <SecretReveal theme={theme} item={item} onCopy={copy} copiedKey={copiedKey} compact />
                                        : <span style={{ color: text3 }}>—</span>}
                                </td>
                                <td className="py-2 px-3 hidden xl:table-cell" style={{ color: text2 }}>{formatDate(item.updatedAt)}</td>
                                <td className="py-2 px-3">
                                    <ItemActions theme={theme} item={item} onCopy={copy} copiedKey={copiedKey}
                                        onEdit={() => !item.broken && setEditing(item)} onDelete={() => setDeleteTarget(item)} />
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderList = () => (
        <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, overflow: 'hidden' }}>
            {pageItems.map((item) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ padding: 16, borderBottom: `1px solid ${border}`, background: bg2 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = bg3)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = bg2)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                                <ItemAvatar type={item.data.type} size="sm" />
                                <h3 style={{ fontSize: 14, fontWeight: 600, color: textC }}>{item.data.title}</h3>
                                <TypeBadge type={item.data.type} />
                                <span style={{ fontSize: 12, color: text2 }} className="hidden sm:inline">{formatDate(item.updatedAt)}</span>
                            </div>
                            <div className="ml-10" style={{ maxWidth: 380 }}>
                                {item.data.type !== 'note'
                                    ? <SecretReveal theme={theme} item={item} onCopy={copy} copiedKey={copiedKey} compact />
                                    : <p style={{ fontSize: 12, color: text2 }}>{item.data.notes ? 'Secure note' : '—'}</p>}
                            </div>
                        </div>
                        <div className="ml-4">
                            <ItemActions theme={theme} item={item} onCopy={copy} copiedKey={copiedKey}
                                onEdit={() => !item.broken && setEditing(item)} onDelete={() => setDeleteTarget(item)} />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    // ── Render ──────────────────────────────────────

    return (
        <div style={{ minHeight: '100vh', background: bg }}>
            {/* Page header */}
            <div style={{ background: bg2, borderBottom: `1px solid ${border}` }}>
                <div className="mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h1 style={{ ...bb(24, { color: ORG }) }}>Password Locker</h1>
                            <p style={{ fontSize: 12, color: text2, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#4ade80' }} /> End-to-end encrypted · AES-256-GCM · Argon2id
                            </p>
                        </div>
                        {phase === 'unlocked' && (
                            <div className="flex items-center space-x-2">
                                <Button theme={theme} variant="ghost" onClick={() => setShowChangeMaster(true)} style={{ padding: '6px 12px' }}>
                                    <Settings className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Master Password</span>
                                </Button>
                                <Button theme={theme} variant="ghost" onClick={lock} style={{ padding: '6px 12px' }}>
                                    <Lock className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Lock</span>
                                </Button>
                                <Button theme={theme} onClick={() => setEditing('new')} style={{ padding: '6px 12px' }}>
                                    <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Add Item</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mx-auto px-4 sm:px-6 py-6 space-y-4">
                {phase === 'loading' && (
                    <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 48, textAlign: 'center' }}>
                        <div className="inline-flex items-center space-x-2">
                            <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid transparent', borderTopColor: ORG }} className="animate-spin" />
                            <span style={{ fontSize: 12, color: text2 }}>Loading your locker...</span>
                        </div>
                    </div>
                )}

                {phase === 'error' && <ErrorText>{loadError}</ErrorText>}
                {phase === 'setup' && <SetupScreen theme={theme} onCreated={onUnlocked} />}
                {phase === 'locked' && status && (
                    <UnlockScreen theme={theme} status={status} onUnlocked={onUnlocked} onDestroyed={loadStatus} />
                )}

                {phase === 'unlocked' && (
                    <>
                        {/* Filter cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {filterCards.map((card, index) => (
                                <motion.button
                                    key={card.key}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setTypeFilter(card.key)}
                                    style={{
                                        background: typeFilter === card.key ? 'rgba(232,98,26,.08)' : bg2,
                                        border: `1px solid ${border}`,
                                        borderLeft: typeFilter === card.key ? `3px solid ${ORG}` : `1px solid ${border}`,
                                        borderRadius: 4,
                                        padding: 12,
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div className="flex items-center space-x-2">
                                        <div style={{ padding: 8, borderRadius: 6, background: 'rgba(232,98,26,.15)', color: ORG }}>
                                            <card.Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p style={bc(9, 700, { letterSpacing: 3, textTransform: 'uppercase', color: text2 })}>{card.label}</p>
                                            <p style={bb(32, { color: ORG, lineHeight: 1 })}>{card.count}</p>
                                        </div>
                                        {typeFilter === card.key && <CheckCircle className="w-4 h-4" style={{ color: ORG }} />}
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Search & controls panel */}
                        <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 16 }}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="relative flex-1 max-w-md">
                                    <Search style={{ width: 16, height: 16, color: text3, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="text"
                                        placeholder="Search title, username, URL..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        style={{
                                            width: '100%', paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                                            fontSize: 12, background: bg3, border: `1px solid ${border}`, borderRadius: 4, color: textC, outline: 'none',
                                        }}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    {['table', 'grid', 'list'].map((mode) => (
                                        <motion.button
                                            key={mode}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setViewMode(mode)}
                                            style={{
                                                padding: 8,
                                                borderRadius: 4,
                                                background: viewMode === mode ? ORG : bg3,
                                                color: viewMode === mode ? '#fff' : text2,
                                                border: `1px solid ${viewMode === mode ? ORG : border}`,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                            title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} View`}
                                        >
                                            {mode === 'table' && <Table className="w-4 h-4" />}
                                            {mode === 'grid' && <Grid3X3 className="w-4 h-4" />}
                                            {mode === 'list' && <List className="w-4 h-4" />}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Active filter tags */}
                        {(typeFilter !== 'all' || query) && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                className="flex items-center flex-wrap gap-2"
                                style={{ background: 'rgba(232,98,26,.08)', border: '1px solid rgba(232,98,26,.2)', borderRadius: 4, padding: 12 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: ORG }}>Active Filters:</span>
                                {typeFilter !== 'all' && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.3)', borderRadius: 4, fontSize: 12, color: ORG }}>
                                        <span>Type: {typeMeta(typeFilter).label}</span>
                                        <button onClick={() => setTypeFilter('all')} style={{ color: ORG, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X className="w-3 h-3" /></button>
                                    </span>
                                )}
                                {query && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: 'rgba(232,98,26,.1)', border: '1px solid rgba(232,98,26,.3)', borderRadius: 4, fontSize: 12, color: ORG }}>
                                        <span>Search: "{query}"</span>
                                        <button onClick={() => setQuery('')} style={{ color: ORG, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X className="w-3 h-3" /></button>
                                    </span>
                                )}
                            </motion.div>
                        )}

                        <ErrorText>{loadError}</ErrorText>

                        {visible.length === 0 ? (
                            <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: 48, textAlign: 'center' }}>
                                <LockKeyhole style={{ width: 48, height: 48, margin: '0 auto 16px', color: text3 }} />
                                <p style={{ fontSize: 16, fontWeight: 600, color: textC, marginBottom: 8 }}>
                                    {items.length ? 'No Items Found' : 'Your Locker Is Empty'}
                                </p>
                                <p style={{ fontSize: 12, color: text2 }}>
                                    {items.length ? 'Try adjusting your filters.' : 'Add your first password or secret key to get started.'}
                                </p>
                            </div>
                        ) : (
                            <div>
                                {viewMode === 'table' && renderTable()}
                                {viewMode === 'grid' && renderGrid()}
                                {viewMode === 'list' && renderList()}

                                {/* Pagination */}
                                <div className="flex items-center justify-between px-4 py-3 mt-2" style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4 }}>
                                    <div style={{ fontSize: 12, color: text2 }}>
                                        Showing {startIdx + 1}-{Math.min(endIdx, visible.length)} of {visible.length}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            onClick={() => setCurrentPage((page) => page - 1)}
                                            disabled={currentPage === 1}
                                            style={{
                                                display: 'flex', alignItems: 'center', padding: '4px 8px', fontSize: 12,
                                                background: bg3, border: `1px solid ${border}`, color: text2, borderRadius: 4,
                                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1,
                                            }}
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                        </motion.button>
                                        <span style={{ fontSize: 12, color: text2 }}>{currentPage} / {totalPages}</span>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            onClick={() => setCurrentPage((page) => page + 1)}
                                            disabled={currentPage === totalPages}
                                            style={{
                                                display: 'flex', alignItems: 'center', padding: '4px 8px', fontSize: 12,
                                                background: bg3, border: `1px solid ${border}`, color: text2, borderRadius: 4,
                                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1,
                                            }}
                                        >
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <p style={{ fontSize: 12, color: text2, marginTop: 4 }}>
                            Locks automatically after 5 minutes of inactivity. Copied secrets are cleared from the clipboard after 30 seconds.
                        </p>
                    </>
                )}

                {/* Delete item confirmation modal */}
                <AnimatePresence>
                    {deleteTarget && (
                        <DeleteItemModal theme={theme} item={deleteTarget} busy={deleteBusy}
                            onCancel={() => { if (!deleteBusy) setDeleteTarget(null); }} onConfirm={confirmDeleteItem} />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {editing && (
                        <ItemModal theme={theme} initial={editing === 'new' ? null : editing.data}
                            onClose={() => setEditing(null)} onSave={saveItem} />
                    )}
                    {showChangeMaster && (
                        <ChangeMasterModal theme={theme} status={status} encryptedDek={encryptedDekRef.current}
                            onClose={() => setShowChangeMaster(false)}
                            onChanged={({ encryptedDek, status: s }) => {
                                encryptedDekRef.current = encryptedDek;
                                setStatus(s);
                                setShowChangeMaster(false);
                                showOperationStatus('success', 'Master password changed successfully');
                            }} />
                    )}
                </AnimatePresence>

                {/* Operation status toast */}
                <AnimatePresence>
                    {operationStatus && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            style={{ position: 'fixed', top: 16, right: 16, zIndex: 70 }}
                        >
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 4, fontSize: 12,
                                background: operationStatus.type === 'success' ? 'rgba(74,222,128,.15)' : 'rgba(232,64,64,.15)',
                                border: `1px solid ${operationStatus.type === 'success' ? 'rgba(74,222,128,.3)' : 'rgba(232,64,64,.3)'}`,
                                color: operationStatus.type === 'success' ? '#4ade80' : '#e84040',
                                boxShadow: '0 4px 24px rgba(0,0,0,.25)',
                            }}>
                                {operationStatus.type === 'success' ? <CheckCircle style={{ width: 16, height: 16, flexShrink: 0 }} /> : <XCircle style={{ width: 16, height: 16, flexShrink: 0 }} />}
                                <span style={{ fontWeight: 600 }}>{operationStatus.message}</span>
                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setOperationStatus(null)}
                                    style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                                    <X style={{ width: 14, height: 14 }} />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
