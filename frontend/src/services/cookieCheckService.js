import api from '../api/api';

class CookieCheckService {
  // Returns true if the browser is blocking the cross-site (SameSite=None)
  // cookies our auth flow relies on. Two round trips: set a probe cookie,
  // then ask the backend whether it came back on the next request.
  async isThirdPartyCookieBlocked() {
    try {
      await api.get('/cookie-check/probe');
      const res = await api.get('/cookie-check/verify');
      return !res.data?.thirdPartyCookiesAllowed;
    } catch {
      // Network/CORS failure isn't a cookie problem — don't false-positive.
      return false;
    }
  }
}

export default new CookieCheckService();
