import { BadGatewayException, Injectable } from '@nestjs/common';

export interface Actor {
  actorEmail: string;
  actorName: string;
}

// Calls AbyDash's trusted /integrations/abytech-hub/* surface. This is a
// server-to-server call — ABYDASH_INTEGRATION_KEY lives only here, never
// reaches this app's own frontend. Its value must exactly match AbyDash's
// own ABYTECH_HUB_INTEGRATION_KEY env var — the two sides name their copy
// of the same secret independently, same as e.g. a webhook signing secret
// would be. Every mutating call carries the real Abytech Hub admin's
// email/name (looked up by the controller from the already-authenticated
// request) so AbyDash's own audit log stays attributable to a real person,
// even though there's no per-admin identity on AbyDash's side for this
// integration — see Report Managment's Abytech Hub integration plan for why.
@Injectable()
export class AbydashIntegrationService {
  private readonly baseUrl = process.env.ABYDASH_API_URL;
  private readonly integrationKey = process.env.ABYDASH_INTEGRATION_KEY;

  private async call(path: string, options: { method?: string; body?: unknown } = {}) {
    if (!this.baseUrl || !this.integrationKey) {
      throw new BadGatewayException('ABYDASH_API_URL / ABYDASH_INTEGRATION_KEY are not configured');
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/integrations/abytech-hub${path}`, {
        method: options.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-integration-key': this.integrationKey,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
    } catch (error) {
      throw new BadGatewayException(`Could not reach AbyDash: ${(error as Error).message}`);
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new BadGatewayException(data?.message || `AbyDash returned ${response.status}`);
    }
    return data;
  }

  listOrganizations() {
    return this.call('/organizations');
  }

  createOrganization(
    input: {
      organizationName: string;
      organizationSlug?: string;
      superAdmin: { name: string; email: string; password: string };
    },
    actor: Actor,
  ) {
    return this.call('/organizations', { method: 'POST', body: { ...input, ...actor } });
  }

  listPlans() {
    return this.call('/plans');
  }

  listModuleDefinitions() {
    return this.call('/modules');
  }

  getOrganizationAccess(organizationId: string) {
    return this.call(`/organizations/${organizationId}/module-access`);
  }

  assignPlan(organizationId: string, planId: string, actor: Actor) {
    return this.call(`/organizations/${organizationId}/assign-plan`, {
      method: 'POST',
      body: { planId, ...actor },
    });
  }

  setModuleOverride(organizationId: string, moduleKey: string, enabled: boolean, actor: Actor) {
    return this.call(`/organizations/${organizationId}/module-override`, {
      method: 'POST',
      body: { moduleKey, enabled, ...actor },
    });
  }

  // Bulk version — grant/revoke several specific modules for one org in a
  // single call (AbyDash applies them in one transaction).
  setModuleOverrides(
    organizationId: string,
    overrides: { moduleKey: string; enabled: boolean }[],
    actor: Actor,
  ) {
    return this.call(`/organizations/${organizationId}/module-overrides`, {
      method: 'POST',
      body: { overrides, ...actor },
    });
  }

  // "Check the whole group, give it to this org." One-time snapshot of the
  // group's current members; enables every non-core module unless told
  // otherwise.
  grantGroup(
    organizationId: string,
    input: { groupKey: string; enabled?: boolean; includeCore?: boolean },
    actor: Actor,
  ) {
    return this.call(`/organizations/${organizationId}/grant-group`, {
      method: 'POST',
      body: { ...input, ...actor },
    });
  }

  // ─── Module group registry ────────────────────────────────────────────
  listModuleGroups() {
    return this.call('/module-groups');
  }

  createModuleGroup(
    input: { key: string; label: string; description?: string; order?: number },
    actor: Actor,
  ) {
    return this.call('/module-groups', {
      method: 'POST',
      body: { ...input, ...actor },
    });
  }

  updateModuleGroup(
    groupKey: string,
    input: { label?: string; description?: string; order?: number },
    actor: Actor,
  ) {
    return this.call(`/module-groups/${groupKey}`, {
      method: 'PATCH',
      body: { ...input, ...actor },
    });
  }

  deleteModuleGroup(groupKey: string, actor: Actor) {
    return this.call(`/module-groups/${groupKey}`, {
      method: 'DELETE',
      body: { ...actor },
    });
  }

  setModuleGroup(
    moduleKey: string,
    groupKey: string,
    order: number | undefined,
    actor: Actor,
  ) {
    return this.call(`/modules/${moduleKey}/group`, {
      method: 'POST',
      body: { groupKey, order, ...actor },
    });
  }
}
