import api from '../api/api';

class DataExportService {
  async exportData({ format = 'json', groups = [] }) {
    const response = await api.post(
      '/data-export/export',
      { format, groups },
      { responseType: 'blob' },
    );
    const ext = format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'json';
    const date = new Date().toISOString().split('T')[0];
    const url = URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `abytech-${format === 'excel' ? 'export' : format === 'pdf' ? 'report' : 'backup'}-${date}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async importPreview(file, { strategy = 'SKIP', groups = [] } = {}) {
    const form = new FormData();
    form.append('file', file);
    form.append('strategy', strategy);
    form.append('groups', JSON.stringify(groups));
    const res = await api.post('/data-export/import/preview', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  async importData(file, { strategy = 'SKIP', groups = [] } = {}) {
    const form = new FormData();
    form.append('file', file);
    form.append('strategy', strategy);
    form.append('groups', JSON.stringify(groups));
    const res = await api.post('/data-export/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  async getImportHistory() {
    const res = await api.get('/data-export/import/history');
    return res.data;
  }

  async rollbackImport(snapshotId) {
    const res = await api.post(`/data-export/import/rollback/${snapshotId}`);
    return res.data;
  }
}

export default new DataExportService();
