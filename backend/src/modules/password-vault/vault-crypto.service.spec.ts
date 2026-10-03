import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { VaultCryptoService } from './vault-crypto.service';

describe('VaultCryptoService', () => {
  const original = process.env.VAULT_SERVER_KEY;
  let service: VaultCryptoService;

  beforeEach(() => {
    process.env.VAULT_SERVER_KEY = randomBytes(32).toString('hex');
    service = new VaultCryptoService();
  });

  afterAll(() => {
    process.env.VAULT_SERVER_KEY = original;
  });

  it('round-trips sealed data bound to its context', () => {
    const sealed = service.seal('{"v":1}', 'vault-item:a');
    expect(sealed).not.toContain('{"v":1}');
    expect(service.open(sealed, 'vault-item:a')).toBe('{"v":1}');
  });

  it('rejects a different context or tampered ciphertext', () => {
    const sealed = service.seal('secret', 'vault-item:a');
    expect(() => service.open(sealed, 'vault-item:b')).toThrow();
    const raw = Buffer.from(sealed.split('.')[1], 'base64');
    raw[raw.length - 1] ^= 1;
    expect(() => service.open(`v1.${raw.toString('base64')}`, 'vault-item:a')).toThrow();
  });

  it('refuses to run without a proper server key', () => {
    process.env.VAULT_SERVER_KEY = 'short';
    expect(() => new VaultCryptoService().seal('x', 'c')).toThrow(ServiceUnavailableException);
  });

  it('verifies auth keys in constant time', async () => {
    const salt = service.newSalt();
    const key = randomBytes(32).toString('base64');
    const hash = await service.hashAuthKey(key, salt);
    await expect(service.verifyAuthKey(key, salt, hash)).resolves.toBe(true);
    await expect(
      service.verifyAuthKey(randomBytes(32).toString('base64'), salt, hash),
    ).resolves.toBe(false);
  });

  it('signs sessions and rejects forged or expired ones', () => {
    const token = service.signSession({ adminId: 'a', vaultId: 'v', sessionVersion: 3 });
    expect(service.verifySession(token)).toMatchObject({ adminId: 'a', vaultId: 'v', sessionVersion: 3 });

    const [body, mac] = token.split('.');
    const forged = Buffer.from(
      JSON.stringify({ adminId: 'b', vaultId: 'v', sessionVersion: 3, exp: Date.now() + 1e6 }),
    ).toString('base64url');
    expect(() => service.verifySession(`${forged}.${mac}`)).toThrow(UnauthorizedException);
    expect(() => service.verifySession(undefined)).toThrow(UnauthorizedException);

    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 31 * 60 * 1000);
    expect(() => service.verifySession(`${body}.${mac}`)).toThrow(UnauthorizedException);
    jest.restoreAllMocks();
  });
});
