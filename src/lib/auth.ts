import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User } from '@/types';

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', credential.user.uid));

  if (!userDoc.exists()) {
    throw new Error('User profile not found. Contact admin.');
  }

  const userData = { ...userDoc.data(), uid: userDoc.id } as User;

  if (!userData.isActive) {
    await firebaseSignOut(auth);
    throw new Error('Account is deactivated. Contact admin.');
  }

  await updateDoc(doc(db, 'users', credential.user.uid), {
    lastLoginAt: serverTimestamp(),
  });

  // Set session cookie if Admin SDK is configured
  try {
    const idToken = await credential.user.getIdToken();
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  } catch {
    // Session cookie creation may fail without Admin SDK — auth still works via Firebase client
  }

  return userData;
}

export async function signOutUser() {
  await fetch('/api/auth/session', { method: 'DELETE' });
  await firebaseSignOut(auth);
}

export async function getCurrentUser(uid: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;
  return { ...userDoc.data(), uid: userDoc.id } as User;
}

export function getRoleRedirectPath(role: string): string {
  switch (role) {
    case 'super_admin': return '/admin';
    case 'support_agent': return '/support';
    case 'client_owner': return '/client';
    case 'client_agent': return '/client/conversations';
    default: return '/login';
  }
}
