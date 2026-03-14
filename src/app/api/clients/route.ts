import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import crypto from 'crypto';

async function verifySession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  try {
    return await adminAuth.verifySessionCookie(session, true);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const decoded = await verifySession();
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { businessName, ownerName, ownerEmail, plan = 'starter' } = body;

    if (!businessName || !ownerName || !ownerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const planPrices: Record<string, number> = { starter: 49, pro: 149, enterprise: 499 };
    const planQuotas: Record<string, number> = { starter: 1000, pro: 10000, enterprise: 100000 };

    // Create Firebase Auth user for the owner
    let ownerUser;
    try {
      ownerUser = await adminAuth.getUserByEmail(ownerEmail);
    } catch {
      ownerUser = await adminAuth.createUser({ email: ownerEmail, displayName: ownerName, password: 'changeme123' });
    }

    const clientRef = await adminDb.collection('clients').add({
      businessName,
      ownerName,
      ownerEmail,
      ownerUid: ownerUser.uid,
      plan,
      planPrice: planPrices[plan] || 49,
      status: 'setup',
      whatsappNumber: null,
      whatsappDisplayName: null,
      wabaId: null,
      phoneNumberId: null,
      apiKey: crypto.randomBytes(24).toString('hex'),
      webhookSecret: crypto.randomBytes(16).toString('hex'),
      storeType: null,
      storeUrl: null,
      storeConnected: false,
      messageQuota: planQuotas[plan] || 1000,
      messagesUsedThisMonth: 0,
      assignedAgentIds: [],
      createdAt: new Date(),
      billingDate: new Date(),
    });

    // Create/update user doc for the owner
    await adminDb.collection('users').doc(ownerUser.uid).set({
      email: ownerEmail,
      name: ownerName,
      role: 'client_owner',
      clientId: clientRef.id,
      assignedClientIds: [],
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true,
      avatarUrl: null,
    });

    return NextResponse.json({ id: clientRef.id }, { status: 201 });
  } catch (error) {
    console.error('Create client error:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
