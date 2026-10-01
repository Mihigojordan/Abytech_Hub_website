import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Lock, LockKeyhole, Unlock, ShieldCheck, ShieldAlert, KeyRound, Code2, StickyNote, Fingerprint,
    Plus, Search, Eye, EyeOff, Copy, Pencil, Trash2, X, Wand2, ExternalLink, Loader2, Settings, Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import vaultService from '../../services/vaultService';
import {
    createVault, deriveUnlockKeys, openDek, rewrapForNewPassword, encryptItem, decryptItem,
    generatePassword, passwordStrength, MIN_MASTER_LENGTH,
} from '../../utils/vaultCrypto';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, bb, bc, ba } from '../../utils/homeConstants';

// ─── Constants ────────────────────────────────────────

const IDLE_LOCK_MS = 5 * 60 * 1000;
const CLIPBOARD_CLEAR_MS = 30 * 1000;

const ITEM_TYPES = [
    { id: 'password', label: 'Password',   Icon: KeyRound },
    { id: 'api_key',  label: 'API / Secret Key', Icon: Code2 },
    { id: 'secret',   label: 'Other Secret', Icon: Fingerprint },
    { id: 'note',     label: 'Secure Note', Icon: StickyNote },
];
const typeMeta = (id) => ITEM_TYPES.find((t) => t.id === id) || ITEM_TYPES[0];

const EMPTY_ITEM = { type: 'password', title: '', username: '', secret: '', url: '', notes: '' };
const STRENGTH_COLORS = ['#e84040', '#f97316', '#fbbf24', '#4ade80', '#22c55e'];

// ─── Small building blocks ────────────────────────────

function Field({ theme, label, children, hint }) {
    return (
        <label style={{ display: 'block', marginBottom: 14 }}>
            <span style={bc(11, 700, { letterSpacing: 1, textTransform: 'uppercase', color: theme.text2 })}>{label}</span>
            <div style={{ marginTop: 6 }}>{children}</div>
            {hint && <span style={ba(11, 400, { color: theme.text2, display: 'block', marginTop: 4 })}>{hint}</span>}
        </label>
    );
}

const inputStyle = (theme) => ({
    width: '100%', padding: '10px 12px', borderRadius: 8, outline: 'none',
    border: `1px solid ${theme.border}`, background: theme.bg2, color: theme.textC,
    ...ba(14),
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
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: theme.text2 }}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
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
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= score ? STRENGTH_COLORS[score] : theme.bg3 }} />
                ))}
            </div>
            <span style={ba(11, 600, { color: STRENGTH_COLORS[score] })}>{label} · ~{bits} bits</span>
        </div>
    );
}

function Button({ theme, children, onClick, variant = 'primary', disabled, type = 'button', style }) {
    const variants = {
        primary: { background: ORG, color: '#fff', border: 'none' },
        ghost:   { background: 'transparent', color: theme.textC, border: `1px solid ${theme.border}` },
        danger:  { background: '#e84040', color: '#fff', border: 'none' },
    };
    return (
        <button type={type} onClick={onClick} disabled={disabled}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 16px', borderRadius: 8,
                cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, ...bc(14, 700, { letterSpacing: 0.5 }), ...variants[variant], ...style }}>
            {children}
        </button>
    );
}

function Modal({ theme, title, onClose, children, width = 520 }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
            style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
                style={{ width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={bb(24, { color: theme.textC, letterSpacing: 1 })}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.text2 }} aria-label="Close"><X size={20} /></button>
                </div>
                {children}
            </motion.div>
        </motion.div>
    );
}

function ErrorText({ children }) {
    if (!children) return null;
    return <p style={ba(13, 600, { color: '#e84040', margin: '4px 0 12px' })}>{children}</p>;
}

// ─── Generator ───────────────────────────────────────

function GeneratorPanel({ theme, onUse }) {
    const [opts, setOpts] = useState({ length: 24, lower: true, upper: true, digits: true, symbols: true });
    const [value, setValue] = useState(() => generatePassword(opts));
    const regen = (next = opts) => setValue(generatePassword(next));
    const toggle = (k) => { const next = { ...opts, [k]: !opts[k] }; setOpts(next); regen(next); };

    return (
        <div style={{ border: `1px dashed ${theme.border}`, borderRadius: 10, padding: 12, marginBottom: 14, background: theme.bg2 }}>
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
        <Modal theme={theme} title={initial ? 'Edit item' : 'New item'} onClose={onClose}>
            <form onSubmit={submit}>
                <Field theme={theme} label="Type">
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {ITEM_TYPES.map(({ id, label, Icon }) => (
                            <button key={id} type="button" onClick={() => setForm((f) => ({ ...f, type: id }))}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                                    border: `1px solid ${form.type === id ? ORG : theme.border}`, background: form.type === id ? `${ORG}22` : theme.bg2,
                                    color: form.type === id ? ORG : theme.textC, ...bc(13, 700) }}>
                                <Icon size={14} /> {label}
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
                        {saving ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />} Encrypt & save
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

// ─── Item row ────────────────────────────────────────

function ItemCard({ theme, item, onCopy, onEdit, onDelete, copiedKey }) {
    const [reveal, setReveal] = useState(false);
    const { Icon, label } = typeMeta(item.data.type);
    const d = item.data;
    const safeUrl = /^https?:\/\//i.test(d.url || '') ? d.url : null;

    return (
        <div style={{ border: `1px solid ${theme.border}`, borderRadius: 12, padding: 14, background: theme.bg2 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${ORG}22`, color: ORG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={bc(17, 700, { color: theme.textC, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>{d.title}</div>
                    <div style={ba(12, 500, { color: theme.text2 })}>
                        {label}{d.username ? ` · ${d.username}` : ''}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                    {safeUrl && (
                        <a href={safeUrl} target="_blank" rel="noopener noreferrer" title="Open site" style={{ color: theme.text2, padding: 6 }}><ExternalLink size={16} /></a>
                    )}
                    <button onClick={onEdit} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.text2, padding: 6 }}><Pencil size={16} /></button>
                    <button onClick={onDelete} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e84040', padding: 6 }}><Trash2 size={16} /></button>
                </div>
            </div>

            {d.type !== 'note' && (
                <div style={{ marginTop: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <code style={{ flex: 1, padding: '8px 10px', borderRadius: 8, background: theme.bg, color: theme.textC, fontSize: 13, wordBreak: 'break-all', border: `1px solid ${theme.border}` }}>
                        {reveal ? d.secret : '•'.repeat(Math.min(d.secret.length || 12, 24))}
                    </code>
                    <button onClick={() => setReveal((r) => !r)} title={reveal ? 'Hide' : 'Reveal'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.text2, padding: 6 }}>
                        {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {d.username && (
                        <button onClick={() => onCopy(d.username, `${item.id}:user`)} title="Copy username"
                            style={{ background: 'none', border: `1px solid ${theme.border}`, borderRadius: 6, cursor: 'pointer', color: theme.text2, padding: '5px 8px', ...bc(12, 700) }}>
                            {copiedKey === `${item.id}:user` ? <Check size={14} /> : 'USER'}
                        </button>
                    )}
                    <button onClick={() => onCopy(d.secret, `${item.id}:secret`)} title="Copy secret (clipboard clears in 30s)"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedKey === `${item.id}:secret` ? '#4ade80' : ORG, padding: 6 }}>
                        {copiedKey === `${item.id}:secret` ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>
            )}
            {d.notes && (
                <p style={ba(13, 400, { color: theme.text2, marginTop: 10, whiteSpace: 'pre-wrap', wordBreak: 'break-word' })}>
                    {d.type === 'note' && !reveal ? (
                        <button onClick={() => setReveal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: ORG, padding: 0, ...bc(13, 700) }}>Show note</button>
                    ) : d.notes}
                </p>
            )}
        </div>
    );
}

// ─── Gate screens (setup / unlock) ───────────────────

function GateCard({ theme, icon: Icon, title, subtitle, children }) {
    return (
        <div style={{ maxWidth: 460, margin: '40px auto', border: `1px solid ${theme.border}`, borderRadius: 16, padding: 28, background: theme.bg2 }}>
            <div style={{ width: 54, height: 54, borderRadius: 14, background: `${ORG}22`, color: ORG, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon size={28} />
            </div>
            <h2 style={bb(30, { color: theme.textC, letterSpacing: 1 })}>{title}</h2>
            <p style={ba(14, 400, { color: theme.text2, margin: '6px 0 20px' })}>{subtitle}</p>
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
        <GateCard theme={theme} icon={ShieldCheck} title="Create your password locker"
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
                    {busy ? <><Loader2 size={15} className="animate-spin" /> Deriving keys…</> : <><LockKeyhole size={15} /> Create locker</>}
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
        <GateCard theme={theme} icon={Lock} title="Locker is locked" subtitle="Enter your master password to decrypt your items on this device.">
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
                    {busy ? <><Loader2 size={15} className="animate-spin" /> Decrypting…</> : <><Unlock size={15} /> Unlock</>}
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
        <Modal theme={theme} title="Delete locker" onClose={onClose} width={440}>
            <p style={ba(14, 400, { color: theme.text2, marginBottom: 14 })}>
                Your items are encrypted with your master password, so they cannot be recovered without it.
                The only option is to permanently delete the locker and start again.
            </p>
            <Field theme={theme} label='Type "DELETE MY VAULT" to confirm'>
                <input value={text} onChange={(e) => setText(e.target.value)} style={inputStyle(theme)} />
            </Field>
            <ErrorText>{error}</ErrorText>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button theme={theme} variant="ghost" onClick={onClose}>Cancel</Button>
                <Button theme={theme} variant="danger" disabled={busy || text !== 'DELETE MY VAULT'} onClick={go}><Trash2 size={15} /> Delete forever</Button>
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
        <Modal theme={theme} title="Change master password" onClose={onClose} width={460}>
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
                        {busy ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />} Change
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

// ─── Page ────────────────────────────────────────────

export default function PasswordVaultPage() {
    const theme = useDashboardTheme();
    const { bg, textC, text2, border } = theme;

    const [phase, setPhase] = useState('loading'); // loading | setup | locked | unlocked | error
    const [status, setStatus] = useState(null);
    const [items, setItems] = useState([]);
    const [loadError, setLoadError] = useState('');
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [editing, setEditing] = useState(null); // null | 'new' | item
    const [showChangeMaster, setShowChangeMaster] = useState(false);
    const [copiedKey, setCopiedKey] = useState(null);

    // Keys live only in memory (never state, storage or the network).
    const dekRef = useRef(null);
    const encryptedDekRef = useRef(null);
    const clipboardTimer = useRef(null);

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
            alert('Clipboard is not available in this browser');
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
    };

    const removeItem = async (item) => {
        if (!window.confirm(`Delete "${item.data.title}" permanently?`)) return;
        try {
            await guard(() => vaultService.deleteItem(item.id));
            setItems((prev) => prev.filter((i) => i.id !== item.id));
        } catch (err) {
            alert(err.message);
        }
    };

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return items.filter((i) => (typeFilter === 'all' || i.data.type === typeFilter)
            && (!q || [i.data.title, i.data.username, i.data.url].some((v) => v?.toLowerCase().includes(q))));
    }, [items, query, typeFilter]);

    // ── Render ──────────────────────────────────────

    const header = (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div>
                <h1 style={bb(34, { color: textC, letterSpacing: 1.5, lineHeight: 1 })}>Password Locker</h1>
                <p style={ba(13, 400, { color: text2, marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' })}>
                    <ShieldCheck size={14} color="#4ade80" /> End-to-end encrypted · AES-256-GCM · Argon2id
                </p>
            </div>
            {phase === 'unlocked' && (
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button theme={theme} variant="ghost" onClick={() => setShowChangeMaster(true)}><Settings size={15} /> Master password</Button>
                    <Button theme={theme} variant="ghost" onClick={lock}><Lock size={15} /> Lock</Button>
                    <Button theme={theme} onClick={() => setEditing('new')}><Plus size={15} /> Add item</Button>
                </div>
            )}
        </div>
    );

    return (
        <div style={{ minHeight: '100%', background: bg, padding: '24px 20px' }}>
            {header}

            {phase === 'loading' && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: text2 }}><Loader2 className="animate-spin" /></div>
            )}
            {phase === 'error' && <ErrorText>{loadError}</ErrorText>}
            {phase === 'setup' && <SetupScreen theme={theme} onCreated={onUnlocked} />}
            {phase === 'locked' && status && (
                <UnlockScreen theme={theme} status={status} onUnlocked={onUnlocked} onDestroyed={loadStatus} />
            )}

            {phase === 'unlocked' && (
                <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                        <div style={{ position: 'relative', flex: '1 1 260px' }}>
                            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: text2 }} />
                            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, username, URL…"
                                style={{ ...inputStyle(theme), paddingLeft: 36 }} />
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {[{ id: 'all', label: 'All' }, ...ITEM_TYPES].map(({ id, label }) => (
                                <button key={id} onClick={() => setTypeFilter(id)}
                                    style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${typeFilter === id ? ORG : border}`,
                                        background: typeFilter === id ? `${ORG}22` : 'transparent', color: typeFilter === id ? ORG : textC, ...bc(13, 700) }}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ErrorText>{loadError}</ErrorText>

                    {visible.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 60, border: `1px dashed ${border}`, borderRadius: 14 }}>
                            <LockKeyhole size={32} color={text2} />
                            <p style={ba(14, 500, { color: text2, marginTop: 10 })}>
                                {items.length ? 'No items match your search.' : 'Your locker is empty. Add your first password or secret key.'}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                            {visible.map((item) => (
                                <ItemCard key={item.id} theme={theme} item={item} copiedKey={copiedKey}
                                    onCopy={copy} onEdit={() => !item.broken && setEditing(item)} onDelete={() => removeItem(item)} />
                            ))}
                        </div>
                    )}

                    <p style={ba(12, 400, { color: text2, marginTop: 20 })}>
                        Locks automatically after 5 minutes of inactivity. Copied secrets are cleared from the clipboard after 30 seconds.
                    </p>
                </>
            )}

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
                        }} />
                )}
            </AnimatePresence>
        </div>
    );
}
