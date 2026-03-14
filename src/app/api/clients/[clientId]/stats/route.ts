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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const decoded = await verifySession();
  if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { clientId } = await params;

  try {
    const [conversationsSnap, automationsSnap, campaignsSnap, templatesSnap] = await Promise.all([
      adminDb.collection('conversations').where('clientId', '==', clientId).get(),
      adminDb.collection('automations').where('clientId', '==', clientId).get(),
      adminDb.collection('campaigns').where('clientId', '==', clientId).get(),
      adminDb.collection('templates').where('clientId', '==', clientId).get(),
    ]);

    const conversations = conversationsSnap.docs.map((d) => d.data());
    const openConversations = conversations.filter((c) => c.status === 'open').length;
    const totalMessages = conversations.reduce((sum, c) => sum + (c.messages?.length || 0), 0);

    return NextResponse.json({
      totalConversations: conversations.length,
      openConversations,
      totalMessages,
      activeAutomations: automationsSnap.docs.filter((d) => d.data().isActive).length,
      totalAutomations: automationsSnap.size,
      totalCampaigns: campaignsSnap.size,
      totalTemplates: templatesSnap.size,
      approvedTemplates: templatesSnap.docs.filter((d) => d.data().status === 'approved').length,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
