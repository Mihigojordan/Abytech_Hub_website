import api from '../api/api';

// Only ciphertext and the derived auth key ever travel through here — see
// utils/vaultCrypto.js for the encryption.
const wrap = async (request, fallback) => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    const data = error.response?.data || {};
    const err = new Error(data.message || fallback);
    err.status = error.response?.status;
    err.attemptsLeft = data.attemptsLeft;
    err.lockedUntil = data.lockedUntil;
    throw err;
  }
};

const vaultService = {
  getStatus: () => wrap(() => api.get('/vault/status'), 'Failed to load vault'),
  setup: (body) => wrap(() => api.post('/vault/setup', body), 'Failed to create vault'),
  unlock: (authKey) => wrap(() => api.post('/vault/unlock', { authKey }), 'Failed to unlock vault'),
  lock: () => wrap(() => api.post('/vault/lock'), 'Failed to lock vault'),
  changeMaster: (body) => wrap(() => api.post('/vault/change-master', body), 'Failed to change master password'),
  destroy: (confirm) => wrap(() => api.delete('/vault', { data: { confirm } }), 'Failed to delete vault'),
  listItems: () => wrap(() => api.get('/vault/items'), 'Failed to load items'),
  createItem: (payload) => wrap(() => api.post('/vault/items', { payload }), 'Failed to save item'),
  updateItem: (id, payload) => wrap(() => api.put(`/vault/items/${id}`, { payload }), 'Failed to save item'),
  deleteItem: (id) => wrap(() => api.delete(`/vault/items/${id}`), 'Failed to delete item'),
};

export default vaultService;
