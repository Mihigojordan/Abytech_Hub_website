import { useCallback, useEffect, useState } from 'react';
import cookieCheckService from '../services/cookieCheckService';

const SESSION_KEY = 'abytech-3p-cookie-check';

// Runs once per browser session (cached in sessionStorage) so we don't spam
// two extra requests on every mount of the login page.
export default function useThirdPartyCookieCheck() {
  const [blocked, setBlocked] = useState(false);
  const [checking, setChecking] = useState(true);

  const runCheck = useCallback(async (force = false) => {
    if (!force) {
      const cached = sessionStorage.getItem(SESSION_KEY);
      if (cached !== null) {
        setBlocked(cached === 'true');
        setChecking(false);
        return cached === 'true';
      }
    }
    setChecking(true);
    const result = await cookieCheckService.isThirdPartyCookieBlocked();
    sessionStorage.setItem(SESSION_KEY, String(result));
    setBlocked(result);
    setChecking(false);
    return result;
  }, []);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  const recheck = useCallback(() => runCheck(true), [runCheck]);

  return { blocked, checking, recheck };
}
