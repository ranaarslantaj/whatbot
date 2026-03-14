import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;

  try {
    const clientDoc = await adminDb.collection('clients').doc(clientId).get();
    if (!clientDoc.exists) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const client = clientDoc.data()!;

    // Verify webhook secret
    const secret = req.headers.get('x-webhook-secret');
    if (secret !== client.webhookSecret) {
      return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 });
    }

    const body = await req.json();
    const { event, data } = body;

    // Handle WhatsApp webhook events
    if (event === 'message.received') {
      const { from, text } = data;

      // Find or create conversation
      const convQuery = await adminDb.collection('conversations')
        .where('clientId', '==', clientId)
        .where('customerPhone', '==', from)
        .limit(1)
        .get();

      if (convQuery.empty) {
        await adminDb.collection('conversations').add({
          clientId,
          customerPhone: from,
          customerName: data.customerName || from,
          lastMessage: text,
          lastMessageAt: new Date(),
          status: 'open',
          unreadCount: 1,
          messages: [{ direction: 'inbound', message: text, createdAt: new Date(), status: 'received' }],
        });
      } else {
        const convDoc = convQuery.docs[0];
        const conv = convDoc.data();
        const messages = [...(conv.messages || []), { direction: 'inbound', message: text, createdAt: new Date(), status: 'received' }];
        await convDoc.ref.update({
          messages,
          lastMessage: text,
          lastMessageAt: new Date(),
          unreadCount: (conv.unreadCount || 0) + 1,
          status: 'open',
        });
      }

      // Increment message count
      await adminDb.collection('clients').doc(clientId).update({
        messagesUsedThisMonth: (client.messagesUsedThisMonth || 0) + 1,
      });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// WhatsApp verification endpoint
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}
