import { Injectable, signal } from '@angular/core';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  UserCredential
} from 'firebase/auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private app: FirebaseApp;
  private auth: Auth;
  public currentUser = signal<User | null>(null);
  private authInitializedPromise: Promise<boolean>;

  constructor() {
    this.app = getApps().length === 0 ? initializeApp(environment.firebase) : getApps()[0];
    this.auth = getAuth(this.app);

    this.authInitializedPromise = new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        this.currentUser.set(user);
        resolve(!!user);
      });
    });
  }

  async waitForAuthReady(): Promise<boolean> {
    return this.authInitializedPromise;
  }

  async login(email: string, pass: string): Promise<UserCredential> {
    const cred = await signInWithEmailAndPassword(this.auth, email, pass);
    this.currentUser.set(cred.user);
    return cred;
  }

  async register(email: string, pass: string): Promise<UserCredential> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, pass);
    this.currentUser.set(cred.user);
    return cred;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUser.set(null);
  }

  getUser(): User | null {
    return this.auth.currentUser || this.currentUser();
  }

  isAuthenticated(): boolean {
    return !!this.getUser();
  }
}
