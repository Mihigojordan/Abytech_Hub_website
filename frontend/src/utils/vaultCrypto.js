import { argon2id } from 'hash-wasm';

// Client side of the AbyDash password locker. The master password never
// leaves the browser: Argon2id stretches it into a master key, HKDF splits
// that into an encryption key (wraps the vault's random data key) and an
// auth key (the only thing the server sees, which it hashes again with
// scrypt). Every item is sealed with AES-256-GCM under the data key.

export const DEFAULT_KDF = { alg: 'argon2id', memoryKiB: 64 * 1024, iterations: 3, parallelism: 1 };

const AAD_DEK = new TextEncoder().encode('abydash-vault/dek/v1');
const AAD_ITEM = new TextEncoder().encode('abydash-vault/item/v1');

const toB64 = (bytes) => {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
};
const fromB64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const randomBytes = (n) => crypto.getRandomValues(new Uint8Array(n));

async function deriveKeys(password, kdfSaltB64, kdf) {
  if (kdf?.alg !== 'argon2id') throw new Error('Unsupported key derivation');
  const master = await argon2id({
    password: password.normalize('NFKC'),
    salt: fromB64(kdfSaltB64),
    parallelism: kdf.parallelism,
    iterations: kdf.iterations,
    memorySize: kdf.memoryKiB,
    hashLength: 32,
    outputType: 'binary',
  });
  const hkdfKey = await crypto.subtle.importKey('raw', master, 'HKDF', false, ['deriveKey', 'deriveBits']);
  master.fill(0);
  const hkdf = (info) => ({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info: new TextEncoder().encode(info) });

  const kek = await crypto.subtle.deriveKey(
    hkdf('abydash-vault/kek/v1'), hkdfKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'],
  );
  const authBits = new Uint8Array(await crypto.subtle.deriveBits(hkdf('abydash-vault/auth/v1'), hkdfKey, 256));
  const authKey = toB64(authBits);
  authBits.fill(0);
  return { kek, authKey };
}

async function seal(key, plaintext, aad) {
  const iv = randomBytes(12);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad }, key, plaintext));
  return { v: 1, iv: toB64(iv), ct: toB64(ct) };
}

async function open(key, blob, aad) {
  if (blob?.v !== 1) throw new Error('Unsupported ciphertext version');
  return new Uint8Array(
    await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(blob.iv), additionalData: aad }, key, fromB64(blob.ct)),
  );
}

const importDek = (raw) => crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);

/** New vault: random 256-bit data key wrapped by the master-password key. */
export async function createVault(password) {
  const kdfSalt = toB64(randomBytes(16));
  const kdfParams = { ...DEFAULT_KDF };
  const { kek, authKey } = await deriveKeys(password, kdfSalt, kdfParams);
  const rawDek = randomBytes(32);
  const encryptedDek = await seal(kek, rawDek, AAD_DEK);
  const dek = await importDek(rawDek);
  rawDek.fill(0);
  return { setup: { kdfSalt, kdfParams, authKey, encryptedDek }, dek, encryptedDek };
}

/** Step 1 of unlocking: derive the auth key to prove the password to the server. */
export const deriveUnlockKeys = (password, status) => deriveKeys(password, status.kdfSalt, status.kdfParams);

/** Step 2 of unlocking: unwrap the data key the server returned. */
export async function openDek(kek, encryptedDek) {
  const raw = await open(kek, encryptedDek, AAD_DEK);
  try {
    return await importDek(raw);
  } finally {
    raw.fill(0);
  }
}

/** Re-wraps the same data key under a new master password (items stay as they are). */
export async function rewrapForNewPassword(currentPassword, newPassword, status, encryptedDek) {
  const current = await deriveKeys(currentPassword, status.kdfSalt, status.kdfParams);
  const raw = await open(current.kek, encryptedDek, AAD_DEK).catch(() => {
    throw new Error('Current master password is wrong');
  });
  try {
    const newKdfSalt = toB64(randomBytes(16));
    const newKdfParams = { ...DEFAULT_KDF };
    const next = await deriveKeys(newPassword, newKdfSalt, newKdfParams);
    const newEncryptedDek = await seal(next.kek, raw, AAD_DEK);
    return {
      body: { currentAuthKey: current.authKey, newKdfSalt, newKdfParams, newAuthKey: next.authKey, newEncryptedDek },
      encryptedDek: newEncryptedDek,
      status: { ...status, kdfSalt: newKdfSalt, kdfParams: newKdfParams },
    };
  } finally {
    raw.fill(0);
  }
}

export async function encryptItem(dek, data) {
  return seal(dek, new TextEncoder().encode(JSON.stringify(data)), AAD_ITEM);
}

export async function decryptItem(dek, blob) {
  return JSON.parse(new TextDecoder().decode(await open(dek, blob, AAD_ITEM)));
}

// ─── Password tools ─────────────────────────────────────────────────────

const CHARSETS = {
  lower: 'abcdefghijkmnopqrstuvwxyz',
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  digits: '23456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/~',
};

/** Unbiased random integer in [0, max) via rejection sampling. */
function randomInt(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf); while (buf[0] >= limit);
  return buf[0] % max;
}

export function generatePassword({ length = 24, lower = true, upper = true, digits = true, symbols = true } = {}) {
  const sets = Object.entries({ lower, upper, digits, symbols }).filter(([, on]) => on).map(([k]) => CHARSETS[k]);
  if (!sets.length) sets.push(CHARSETS.lower);
  const all = sets.join('');
  // One from every chosen class, the rest from the union, then shuffle.
  const chars = sets.map((set) => set[randomInt(set.length)]);
  while (chars.length < length) chars.push(all[randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

// Predictable chunks an attacker's wordlist tries first; each match only
// counts as a single character of entropy.
const COMMON_PATTERNS = /password|passw0rd|qwerty|azerty|letmein|welcome|admin|abytech|abydash|iloveyou|monkey|dragon|master|secret|(?:0123|1234|2345|3456|4567|5678|6789|7890)\d*|(?:abcd|bcde|cdef)[a-z]*|(.)\1{2,}/gi;

/** Rough entropy estimate → { score 0-4, label }. */
export function passwordStrength(pw = '') {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
  const effective = pw.replace(COMMON_PATTERNS, '\u0000');
  const unique = new Set(effective).size;
  const bits = pool ? Math.min(effective.length, unique * 2) * Math.log2(pool) : 0;
  const score = bits < 40 ? 0 : bits < 60 ? 1 : bits < 80 ? 2 : bits < 100 ? 3 : 4;
  return { score, bits: Math.round(bits), label: ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'][score] };
}

export const MIN_MASTER_LENGTH = 12;
