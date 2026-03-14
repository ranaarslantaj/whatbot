import type { User, UserRole } from '@/types';

const permissions: Record<UserRole, string[]> = {
  super_admin: [
    'view:all_clients', 'create:client', 'edit:client', 'suspend:client',
    'view:all_agents', 'create:agent', 'edit:agent',
    'view:all_tickets', 'reply:ticket', 'assign:ticket',
    'view:billing_global', 'edit:api_config', 'approve:template',
    'impersonate:client', 'view:analytics_global',
    'create:quick_reply', 'edit:quick_reply',
    'view:own_client_data', 'manage:automations', 'send:campaign',
    'view:conversations', 'reply:conversation', 'manage:templates',
  ],
  support_agent: [
    'view:assigned_clients', 'view:assigned_tickets',
    'reply:ticket', 'create:ticket',
    'view:quick_replies', 'create:quick_reply',
    'view:knowledge_base',
  ],
  client_owner: [
    'view:own_client_data', 'edit:own_client_data',
    'manage:integrations', 'manage:automations',
    'manage:templates', 'send:campaign',
    'view:conversations', 'reply:conversation',
    'view:own_billing', 'invite:client_agent',
    'create:ticket', 'view:own_tickets',
  ],
  client_agent: [
    'view:conversations', 'reply:conversation',
    'view:own_client_data',
  ],
};

export function hasPermission(userRole: UserRole, permission: string): boolean {
  return permissions[userRole]?.includes(permission) ?? false;
}

export function canAccessClient(user: User, clientId: string): boolean {
  if (user.role === 'super_admin') return true;
  if (user.role === 'support_agent') return user.assignedClientIds.includes(clientId);
  if (user.role === 'client_owner' || user.role === 'client_agent') return user.clientId === clientId;
  return false;
}
