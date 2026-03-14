import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

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
    const { name, email } = await req.json();
    if (!name || !email) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    let agentUser;
    try {
      agentUser = await adminAuth.getUserByEmail(email);
    } catch {
      agentUser = await adminAuth.createUser({ email, displayName: name, password: 'changeme123' });
    }

    await adminDb.collection('users').doc(agentUser.uid).set({
      email,
      name,
      role: 'support_agent',
      clientId: null,
      assignedClientIds: [],
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true,
      avatarUrl: null,
    });

    return NextResponse.json({ uid: agentUser.uid }, { status: 201 });
  } catch (error) {
    console.error('Create agent error:', error);
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}
