import {
  collection, doc, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, serverTimestamp,
  type Query, type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Client, User, Ticket, TicketMessage, Template,
  Automation, Campaign, Conversation, ConversationMessage, QuickReply,
} from '@/types';

// ── Clients ──────────────────────────────────────────

export function subscribeClients(callback: (clients: Client[]) => void) {
  const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Client)));
  });
}

export async function getClient(clientId: string): Promise<Client | null> {
  const snap = await getDoc(doc(db, 'clients', clientId));
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as Client;
}

export async function createClient(data: Omit<Client, 'id' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, 'clients'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
}

export async function updateClient(clientId: string, data: Partial<Client>) {
  await updateDoc(doc(db, 'clients', clientId), data as DocumentData);
}

export async function suspendClient(clientId: string) {
  await updateDoc(doc(db, 'clients', clientId), { status: 'suspended' });
}

// ── Users / Agents ───────────────────────────────────

export function subscribeAgents(callback: (agents: User[]) => void) {
  const q = query(collection(db, 'users'), where('role', '==', 'support_agent'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ ...d.data(), uid: d.id } as User)));
  });
}

export async function updateAgentAssignments(agentId: string, clientIds: string[]) {
  await updateDoc(doc(db, 'users', agentId), { assignedClientIds: clientIds });
}

// ── Tickets ──────────────────────────────────────────

export function subscribeTickets(
  callback: (tickets: Ticket[]) => void,
  filters?: { clientId?: string; agentId?: string; status?: string }
) {
  let q: Query<DocumentData> = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
  if (filters?.clientId) q = query(collection(db, 'tickets'), where('clientId', '==', filters.clientId), orderBy('createdAt', 'desc'));
  else if (filters?.agentId) q = query(collection(db, 'tickets'), where('assignedAgentId', '==', filters.agentId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Ticket)));
  });
}

export async function getTicket(ticketId: string): Promise<Ticket | null> {
  const snap = await getDoc(doc(db, 'tickets', ticketId));
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as Ticket;
}

export async function createTicket(data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) {
  const docRef = await addDoc(collection(db, 'tickets'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return docRef.id;
}

export async function updateTicket(ticketId: string, data: Partial<Ticket>) {
  await updateDoc(doc(db, 'tickets', ticketId), { ...data, updatedAt: serverTimestamp() } as DocumentData);
}

export async function addTicketMessage(ticketId: string, message: Omit<TicketMessage, 'createdAt'>) {
  const ticketRef = doc(db, 'tickets', ticketId);
  const snap = await getDoc(ticketRef);
  if (!snap.exists()) throw new Error('Ticket not found');
  const ticket = snap.data() as Ticket;
  const messages = [...(ticket.messages || []), { ...message, createdAt: new Date() }];
  await updateDoc(ticketRef, { messages, updatedAt: serverTimestamp() } as DocumentData);
}

export async function closeTicket(ticketId: string) {
  await updateDoc(doc(db, 'tickets', ticketId), { status: 'closed', resolvedAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

// ── Templates ────────────────────────────────────────

export function subscribeTemplates(callback: (templates: Template[]) => void, clientId?: string) {
  const q = clientId
    ? query(collection(db, 'templates'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'))
    : query(collection(db, 'templates'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Template)));
  });
}

export async function createTemplate(data: Omit<Template, 'id' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, 'templates'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
}

export async function approveTemplate(templateId: string) {
  await updateDoc(doc(db, 'templates', templateId), { status: 'approved', approvedAt: serverTimestamp() });
}

export async function rejectTemplate(templateId: string, reason: string) {
  await updateDoc(doc(db, 'templates', templateId), { status: 'rejected', rejectionReason: reason });
}

// ── Automations ──────────────────────────────────────

export function subscribeAutomations(clientId: string, callback: (automations: Automation[]) => void) {
  const q = query(collection(db, 'automations'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Automation)));
  });
}

export async function createAutomation(data: Omit<Automation, 'id' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, 'automations'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
}

export async function toggleAutomation(id: string, isActive: boolean) {
  await updateDoc(doc(db, 'automations', id), { isActive });
}

// ── Campaigns ────────────────────────────────────────

export function subscribeCampaigns(clientId: string, callback: (campaigns: Campaign[]) => void) {
  const q = query(collection(db, 'campaigns'), where('clientId', '==', clientId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Campaign)));
  });
}

export async function createCampaign(data: Omit<Campaign, 'id' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, 'campaigns'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
}

// ── Conversations ────────────────────────────────────

export function subscribeConversations(clientId: string, callback: (conversations: Conversation[]) => void) {
  const q = query(collection(db, 'conversations'), where('clientId', '==', clientId), orderBy('lastMessageAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Conversation)));
  });
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const snap = await getDoc(doc(db, 'conversations', id));
  if (!snap.exists()) return null;
  return { ...snap.data(), id: snap.id } as Conversation;
}

export async function addConversationMessage(conversationId: string, message: Omit<ConversationMessage, 'createdAt'>) {
  const convRef = doc(db, 'conversations', conversationId);
  const snap = await getDoc(convRef);
  if (!snap.exists()) throw new Error('Conversation not found');
  const conv = snap.data() as Conversation;
  const messages = [...(conv.messages || []), { ...message, createdAt: new Date() }];
  await updateDoc(convRef, {
    messages, lastMessage: message.message, lastMessageAt: serverTimestamp(),
    unreadCount: message.direction === 'inbound' ? (conv.unreadCount || 0) + 1 : 0,
  } as DocumentData);
}

export async function resolveConversation(id: string) {
  await updateDoc(doc(db, 'conversations', id), { status: 'resolved', unreadCount: 0 });
}

// ── Quick Replies ────────────────────────────────────

export function subscribeQuickReplies(callback: (replies: QuickReply[]) => void) {
  const q = query(collection(db, 'quickReplies'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as QuickReply)));
  });
}

export async function createQuickReply(data: Omit<QuickReply, 'id' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, 'quickReplies'), { ...data, createdAt: serverTimestamp() });
  return docRef.id;
}

export async function deleteQuickReply(id: string) {
  await deleteDoc(doc(db, 'quickReplies', id));
}
