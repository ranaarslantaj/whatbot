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

  try {
    const { email, name, role, clientId } = await req.json();
    if (!email || !name || !role || !clientId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify caller is client_owner or super_admin
    const callerDoc = await adminDb.collection('users').doc(decoded.uid).get();
    const callerRole = callerDoc.data()?.role;
    if (callerRole !== 'super_admin' && callerRole !== 'client_owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let invitedUser;
    try {
      invitedUser = await adminAuth.getUserByEmail(email);
    } catch {
      invitedUser = await adminAuth.createUser({ email, displayName: name, password: 'changeme123' });
    }

    await adminDb.collection('users').doc(invitedUser.uid).set({
      email,
      name,
      role,
      clientId,
      assignedClientIds: [],
      createdAt: new Date(),
      lastLoginAt: new Date(),
      isActive: true,
      avatarUrl: null,
    });

    return NextResponse.json({ uid: invitedUser.uid }, { status: 201 });
  } catch (error) {
    console.error('Invite error:', error);
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 });
  }
}
