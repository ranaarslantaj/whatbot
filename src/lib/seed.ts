import { adminDb, adminAuth } from './firebase-admin';

const users = [
  { email: 'admin@whatbot.com', name: 'Sarah Admin', role: 'super_admin', clientId: null, password: 'admin123' },
  { email: 'agent1@whatbot.com', name: 'Mike Support', role: 'support_agent', clientId: null, password: 'agent123' },
  { email: 'agent2@whatbot.com', name: 'Lisa Support', role: 'support_agent', clientId: null, password: 'agent123' },
  { email: 'owner@freshbites.com', name: 'John Fresh', role: 'client_owner', clientId: 'CLIENT_FRESHBITES', password: 'client123' },
  { email: 'owner@urbanstyle.com', name: 'Emma Urban', role: 'client_owner', clientId: 'CLIENT_URBANSTYLE', password: 'client123' },
  { email: 'team@freshbites.com', name: 'Alex Fresh', role: 'client_agent', clientId: 'CLIENT_FRESHBITES', password: 'client123' },
];

const clients = [
  {
    id: 'CLIENT_FRESHBITES',
    businessName: 'FreshBites Delivery',
    ownerName: 'John Fresh',
    ownerEmail: 'owner@freshbites.com',
    plan: 'pro',
    planPrice: 149,
    status: 'active',
    whatsappNumber: '+1234567890',
    whatsappDisplayName: 'FreshBites',
    wabaId: 'waba_001',
    phoneNumberId: 'phone_001',
    apiKey: 'fb_api_key_demo_12345678',
    webhookSecret: 'fb_webhook_secret_demo',
    storeType: 'shopify',
    storeUrl: 'https://freshbites.myshopify.com',
    storeConnected: true,
    messageQuota: 10000,
    messagesUsedThisMonth: 3456,
    assignedAgentIds: [] as string[],
  },
  {
    id: 'CLIENT_URBANSTYLE',
    businessName: 'UrbanStyle Fashion',
    ownerName: 'Emma Urban',
    ownerEmail: 'owner@urbanstyle.com',
    plan: 'starter',
    planPrice: 49,
    status: 'active',
    whatsappNumber: '+1987654321',
    whatsappDisplayName: 'UrbanStyle',
    wabaId: 'waba_002',
    phoneNumberId: 'phone_002',
    apiKey: 'us_api_key_demo_87654321',
    webhookSecret: 'us_webhook_secret_demo',
    storeType: 'woocommerce',
    storeUrl: 'https://urbanstyle.com',
    storeConnected: true,
    messageQuota: 1000,
    messagesUsedThisMonth: 723,
    assignedAgentIds: [] as string[],
  },
];

const templates = [
  { clientId: 'CLIENT_FRESHBITES', name: 'Order Confirmation', category: 'transactional', language: 'en', headerText: 'Order Confirmed!', bodyText: 'Hi {{1}}, your order #{{2}} has been confirmed. Estimated delivery: {{3}}.', footerText: 'Thank you for choosing FreshBites!', status: 'approved' },
  { clientId: 'CLIENT_FRESHBITES', name: 'Delivery Update', category: 'transactional', language: 'en', headerText: null, bodyText: 'Hi {{1}}, your order #{{2}} is out for delivery! Track: {{3}}', footerText: null, status: 'approved' },
  { clientId: 'CLIENT_FRESHBITES', name: 'Weekend Special', category: 'marketing', language: 'en', headerText: 'Weekend Deals!', bodyText: 'Hey {{1}}! This weekend only: {{2}}% off all orders over ${{3}}. Use code: {{4}}', footerText: 'Reply STOP to unsubscribe', status: 'pending_review' },
  { clientId: 'CLIENT_URBANSTYLE', name: 'Welcome Message', category: 'transactional', language: 'en', headerText: 'Welcome!', bodyText: 'Welcome to UrbanStyle, {{1}}! Browse our latest collection at {{2}}.', footerText: null, status: 'approved' },
  { clientId: 'CLIENT_URBANSTYLE', name: 'Flash Sale', category: 'marketing', language: 'en', headerText: null, bodyText: 'Flash Sale Alert! {{1}}% off everything for the next {{2}} hours. Shop now!', footerText: 'Reply STOP to opt out', status: 'pending_review' },
];

const automations = [
  { clientId: 'CLIENT_FRESHBITES', name: 'Order Confirmation Auto', trigger: 'order.created', templateId: 'tpl_1', templateName: 'Order Confirmation', delayMinutes: 0, isActive: true, sentCount: 1289 },
  { clientId: 'CLIENT_FRESHBITES', name: 'Delivery Notification', trigger: 'order.shipped', templateId: 'tpl_2', templateName: 'Delivery Update', delayMinutes: 0, isActive: true, sentCount: 1105 },
  { clientId: 'CLIENT_FRESHBITES', name: 'Cart Recovery', trigger: 'cart.abandoned', templateId: 'tpl_3', templateName: 'Weekend Special', delayMinutes: 60, isActive: false, sentCount: 423 },
  { clientId: 'CLIENT_URBANSTYLE', name: 'Welcome Flow', trigger: 'order.created', templateId: 'tpl_4', templateName: 'Welcome Message', delayMinutes: 0, isActive: true, sentCount: 567 },
];

const campaigns = [
  { clientId: 'CLIENT_FRESHBITES', name: 'March Promo Blast', templateId: 'tpl_3', templateName: 'Weekend Special', audienceSize: 2500, sentCount: 2500, deliveredCount: 2340, readCount: 1850, status: 'completed', scheduledAt: new Date('2026-03-01'), completedAt: new Date('2026-03-01') },
  { clientId: 'CLIENT_FRESHBITES', name: 'Spring Launch', templateId: 'tpl_1', templateName: 'Order Confirmation', audienceSize: 5000, sentCount: 0, deliveredCount: 0, readCount: 0, status: 'scheduled', scheduledAt: new Date('2026-03-20'), completedAt: null },
  { clientId: 'CLIENT_URBANSTYLE', name: 'New Arrivals Announce', templateId: 'tpl_4', templateName: 'Welcome Message', audienceSize: 1200, sentCount: 1200, deliveredCount: 1150, readCount: 890, status: 'completed', scheduledAt: new Date('2026-02-15'), completedAt: new Date('2026-02-15') },
];

const conversations = [
  {
    clientId: 'CLIENT_FRESHBITES', customerPhone: '+1555000101', customerName: 'Carlos Rivera', lastMessage: 'When will my order arrive?', status: 'open', unreadCount: 2,
    messages: [
      { direction: 'inbound', message: 'Hi, I placed an order 2 hours ago', status: 'received' },
      { direction: 'outbound', message: 'Hi Carlos! Let me check on that for you.', status: 'delivered' },
      { direction: 'inbound', message: 'When will my order arrive?', status: 'received' },
    ],
  },
  {
    clientId: 'CLIENT_FRESHBITES', customerPhone: '+1555000102', customerName: 'Maria Santos', lastMessage: 'Thank you!', status: 'resolved', unreadCount: 0,
    messages: [
      { direction: 'inbound', message: 'Can I change my delivery address?', status: 'received' },
      { direction: 'outbound', message: 'Of course! Please provide your new address.', status: 'read' },
      { direction: 'inbound', message: '123 New St, Apt 4B', status: 'received' },
      { direction: 'outbound', message: 'Updated! Your order will arrive at the new address.', status: 'read' },
      { direction: 'inbound', message: 'Thank you!', status: 'received' },
    ],
  },
  {
    clientId: 'CLIENT_FRESHBITES', customerPhone: '+1555000103', customerName: 'David Kim', lastMessage: 'Ok I will wait', status: 'waiting', unreadCount: 0,
    messages: [
      { direction: 'inbound', message: 'My food arrived cold', status: 'received' },
      { direction: 'outbound', message: 'We are so sorry about that David. Let me escalate this to our team.', status: 'delivered' },
      { direction: 'inbound', message: 'Ok I will wait', status: 'received' },
    ],
  },
  {
    clientId: 'CLIENT_URBANSTYLE', customerPhone: '+1555000201', customerName: 'Sophie Turner', lastMessage: 'Do you have this in size M?', status: 'open', unreadCount: 1,
    messages: [
      { direction: 'inbound', message: 'Do you have this in size M?', status: 'received' },
    ],
  },
];

const tickets = [
  { clientId: 'CLIENT_FRESHBITES', clientName: 'FreshBites Delivery', subject: 'WhatsApp number verification issue', description: 'We are stuck on the WhatsApp number verification step. The OTP is not coming through.', priority: 'urgent', status: 'open', assignedAgentId: null as string | null, assignedAgentName: null as string | null, messages: [] },
  { clientId: 'CLIENT_FRESHBITES', clientName: 'FreshBites Delivery', subject: 'Template rejected - need help', description: 'Our Weekend Special template was rejected. Can you help us fix it?', priority: 'medium', status: 'in_progress', assignedAgentId: null as string | null, assignedAgentName: null as string | null, messages: [] },
  { clientId: 'CLIENT_URBANSTYLE', clientName: 'UrbanStyle Fashion', subject: 'Billing inquiry', description: 'We were charged twice for the February billing cycle.', priority: 'medium', status: 'open', assignedAgentId: null as string | null, assignedAgentName: null as string | null, messages: [] },
  { clientId: 'CLIENT_URBANSTYLE', clientName: 'UrbanStyle Fashion', subject: 'Shopify integration not syncing', description: 'Orders from Shopify are not triggering the automations. We connected the store last week.', priority: 'low', status: 'resolved', assignedAgentId: null as string | null, assignedAgentName: null as string | null, messages: [{ senderId: 'system', senderName: 'System', senderRole: 'super_admin' as const, message: 'This was resolved by reconnecting the store integration.', createdAt: new Date() }], resolvedAt: new Date() },
];

const quickReplies = [
  { title: 'Greeting', category: 'General', content: 'Hello! Thank you for reaching out. How can I help you today?', createdBy: 'system' },
  { title: 'Order Status', category: 'Orders', content: 'Let me check on your order status. Could you please provide your order number?', createdBy: 'system' },
  { title: 'Escalation', category: 'Support', content: 'I understand your concern. Let me escalate this to our senior team for a faster resolution.', createdBy: 'system' },
  { title: 'Closing', category: 'General', content: 'Is there anything else I can help you with? Thank you for your patience!', createdBy: 'system' },
  { title: 'Refund Process', category: 'Billing', content: 'I have initiated your refund. It typically takes 3-5 business days to reflect in your account.', createdBy: 'system' },
];

export async function seedDatabase() {
  console.log('Starting database seed...');

  // 1. Create users
  const userUids: Record<string, string> = {};
  for (const u of users) {
    let firebaseUser;
    try {
      firebaseUser = await adminAuth.getUserByEmail(u.email);
    } catch {
      firebaseUser = await adminAuth.createUser({ email: u.email, displayName: u.name, password: u.password });
    }
    userUids[u.email] = firebaseUser.uid;

    await adminDb.collection('users').doc(firebaseUser.uid).set({
      email: u.email,
      name: u.name,
      role: u.role,
      clientId: u.clientId,
      assignedClientIds: u.role === 'support_agent' ? clients.map((c) => c.id) : [],
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true,
      avatarUrl: null,
    });
    console.log(`  User: ${u.email} (${firebaseUser.uid})`);
  }

  // 2. Create clients
  for (const c of clients) {
    const ownerUid = userUids[c.ownerEmail] || '';
    c.assignedAgentIds = [userUids['agent1@whatbot.com'], userUids['agent2@whatbot.com']].filter(Boolean);
    await adminDb.collection('clients').doc(c.id).set({
      ...c,
      ownerUid,
      createdAt: new Date(),
      billingDate: new Date(),
    });
    console.log(`  Client: ${c.businessName}`);
  }

  // 3. Create templates
  for (const t of templates) {
    await adminDb.collection('templates').add({
      ...t,
      rejectionReason: null,
      createdAt: new Date(),
      approvedAt: t.status === 'approved' ? new Date() : null,
    });
  }
  console.log(`  Templates: ${templates.length} created`);

  // 4. Create automations
  for (const a of automations) {
    await adminDb.collection('automations').add({ ...a, createdAt: new Date() });
  }
  console.log(`  Automations: ${automations.length} created`);

  // 5. Create campaigns
  for (const c of campaigns) {
    await adminDb.collection('campaigns').add({ ...c, createdAt: new Date() });
  }
  console.log(`  Campaigns: ${campaigns.length} created`);

  // 6. Create conversations
  for (const conv of conversations) {
    const msgs = conv.messages.map((m) => ({ ...m, createdAt: new Date() }));
    await adminDb.collection('conversations').add({
      ...conv,
      messages: msgs,
      lastMessageAt: new Date(),
    });
  }
  console.log(`  Conversations: ${conversations.length} created`);

  // 7. Create tickets
  const agent1Uid = userUids['agent1@whatbot.com'];
  const agent1Name = 'Mike Support';
  tickets[1].assignedAgentId = agent1Uid;
  tickets[1].assignedAgentName = agent1Name;
  tickets[3].assignedAgentId = agent1Uid;
  tickets[3].assignedAgentName = agent1Name;

  for (const t of tickets) {
    await adminDb.collection('tickets').add({
      ...t,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: t.status === 'resolved' ? new Date() : null,
    });
  }
  console.log(`  Tickets: ${tickets.length} created`);

  // 8. Create quick replies
  for (const qr of quickReplies) {
    await adminDb.collection('quickReplies').add({ ...qr, createdAt: new Date() });
  }
  console.log(`  Quick Replies: ${quickReplies.length} created`);

  console.log('Database seeded successfully!');
  console.log('\nDemo Credentials:');
  console.log('  Admin:   admin@whatbot.com / admin123');
  console.log('  Agent:   agent1@whatbot.com / agent123');
  console.log('  Client:  owner@freshbites.com / client123');
}
