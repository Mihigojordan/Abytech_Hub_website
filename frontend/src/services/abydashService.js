// Real service — calls this app's own backend (/abydash/*), which in turn
// calls AbyDash's trusted /integrations/abytech-hub/* surface using a
// server-to-server shared secret. No mock data, no localStorage: this is
// the actual AbyDash Organization/Plan/ModuleDefinition data, live.
// See D:\project\JOB\Report Managment's Abytech Hub integration plan.
import api from '../api/api';

class AbydashService {
  async getAllOrganizations() {
    try {
      const response = await api.get('/abydash/organizations');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch organizations');
    }
  }

  async createOrganization({ organizationName, organizationSlug, superAdmin }) {
    try {
      const response = await api.post('/abydash/organizations', {
        organizationName,
        organizationSlug,
        superAdmin,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create organization');
    }
  }

  async getAllPlans() {
    try {
      const response = await api.get('/abydash/plans');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch plans');
    }
  }

  async getAllModuleDefinitions() {
    try {
      const response = await api.get('/abydash/modules');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch module definitions');
    }
  }

  async getOrganizationModuleAccess(organizationId) {
    try {
      const response = await api.get(`/abydash/organizations/${organizationId}/module-access`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch module access');
    }
  }

  async assignPlan(organizationId, planId) {
    try {
      const response = await api.post(`/abydash/organizations/${organizationId}/assign-plan`, { planId });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to assign plan');
    }
  }

  async setModuleOverride(organizationId, moduleKey, enabled) {
    try {
      const response = await api.post(`/abydash/organizations/${organizationId}/module-override`, {
        moduleKey,
        enabled,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update module access');
    }
  }

  // Grant/revoke several specific modules in one call.
  async setModuleOverrides(organizationId, overrides) {
    try {
      const response = await api.post(`/abydash/organizations/${organizationId}/module-overrides`, {
        overrides,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update module access');
    }
  }

  // Grant a whole module group to an org (every non-core module in it).
  async grantGroup(organizationId, { groupKey, enabled = true, includeCore = false }) {
    try {
      const response = await api.post(`/abydash/organizations/${organizationId}/grant-group`, {
        groupKey,
        enabled,
        includeCore,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to grant module group');
    }
  }

  async getModuleGroups() {
    try {
      const response = await api.get('/abydash/module-groups');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch module groups');
    }
  }

  async createModuleGroup({ key, label, description, order }) {
    try {
      const response = await api.post('/abydash/module-groups', { key, label, description, order });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create module group');
    }
  }

  async updateModuleGroup(groupKey, { label, description, order }) {
    try {
      const response = await api.patch(`/abydash/module-groups/${groupKey}`, { label, description, order });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update module group');
    }
  }

  async deleteModuleGroup(groupKey) {
    try {
      const response = await api.delete(`/abydash/module-groups/${groupKey}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete module group');
    }
  }

  async setModuleGroup(moduleKey, groupKey, order) {
    try {
      const response = await api.post(`/abydash/modules/${moduleKey}/group`, { groupKey, order });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to move module');
    }
  }
}

const abydashService = new AbydashService();
export default abydashService;
