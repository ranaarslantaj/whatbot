import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getApp() {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey || !privateKey.includes('PRIVATE KEY')) {
    // Initialize without credentials for build-time / missing config
    return initializeApp({ projectId: projectId || 'demo-project' });
  }

  try {
    const serviceAccount: ServiceAccount = { projectId, clientEmail, privateKey };
    return initializeApp({ credential: cert(serviceAccount) });
  } catch {
    return initializeApp({ projectId });
  }
}

const app = getApp();

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
