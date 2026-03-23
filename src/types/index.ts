import { Timestamp } from 'firebase/firestore';

export type UserRole = 'super_admin' | 'support_agent' | 'client_owner' | 'client_agent';
export type ClientPlan = 'starter' | 'pro' | 'enterprise';
export type ClientStatus = 'active' | 'suspended' | 'setup' | 'verifying';
export type TicketPriority = 'urgent' | 'medium' | 'low';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TemplateCategory = 'transactional' | 'marketing' | 'otp';
export type TemplateStatus = 'draft' | 'pending_review' | 'pending_meta' | 'approved' | 'rejected';
export type AutomationTrigger = 'order.created' | 'order.shipped' | 'order.delivered' | 'cart.abandoned' | 'payment.confirmed';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
export type ConversationStatus = 'open' | 'resolved' | 'waiting';
export type StoreType = 'shopify' | 'woocommerce' | 'custom';
export type MessageDirection = 'inbound' | 'outbound';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  clientId: string | null;
  assignedClientIds: string[];
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  isActive: boolean;
  avatarUrl: string | null;
}

export interface Client {
  id: string;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  ownerUid: string;
  plan: ClientPlan;
  planPrice: number;
  status: ClientStatus;
  whatsappNumber: string | null;
  whatsappDisplayName: string | null;
  wabaId: string | null;
  phoneNumberId: string | null;
  apiKey: string;
  webhookSecret: string;
  storeType: StoreType | null;
  storeUrl: string | null;
  storeConnected: boolean;
  messageQuota: number;
  messagesUsedThisMonth: number;
  assignedAgentIds: string[];
  createdAt: Timestamp;
  billingDate: Timestamp;
}

export interface TicketMessage {
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  createdAt: Timestamp;
}

export interface Ticket {
  id: string;
  clientId: string;
  clientName: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  messages: TicketMessage[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt: Timestamp | null;
}

export interface Template {
  id: string;
  clientId: string;
  name: string;
  category: TemplateCategory;
  language: string;
  headerText: string | null;
  bodyText: string;
  footerText: string | null;
  status: TemplateStatus;
  rejectionReason: string | null;
  createdAt: Timestamp;
  approvedAt: Timestamp | null;
}

export interface Automation {
  id: string;
  clientId: string;
  name: string;
  trigger: AutomationTrigger;
  templateId: string;
  templateName: string;
  delayMinutes: number;
  isActive: boolean;
  sentCount: number;
  createdAt: Timestamp;
}

export interface Campaign {
  id: string;
  clientId: string;
  name: string;
  templateId: string;
  templateName: string;
  audienceSize: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  status: CampaignStatus;
  scheduledAt: Timestamp | null;
  completedAt: Timestamp | null;
  createdAt: Timestamp;
}

export interface ConversationMessage {
  direction: MessageDirection;
  message: string;
  createdAt: Timestamp;
  status: string;
}

export interface Conversation {
  id: string;
  clientId: string;
  customerPhone: string;
  customerName: string;
  lastMessage: string;
  lastMessageAt: Timestamp;
  status: ConversationStatus;
  unreadCount: number;
  messages: ConversationMessage[];
}

export interface QuickReply {
  id: string;
  title: string;
  category: string;
  content: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: Timestamp;
}
