import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import type { AuthUser, Credentials } from '../types';

const toAuthUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
});

export async function register({ email, password }: Credentials): Promise<void> {
  await createUserWithEmailAndPassword(auth, email.trim(), password);
}

export async function login({ email, password }: Credentials): Promise<void> {
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function loginWithGoogle(): Promise<void> {
  await signInWithPopup(auth, googleProvider);
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

/** Token JWT del usuario actual, para autenticar llamadas a la serverless function */
export async function getIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay sesión activa');
  return user.getIdToken();
}

/**
 * Patrón Observer: Firebase notifica cada cambio de sesión (login, logout, recarga).
 * Devuelve la función para desuscribirse.
 */
export function subscribeToAuthChanges(callback: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => callback(user ? toAuthUser(user) : null));
}
