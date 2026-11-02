import { User, AuthResponse } from '../types/auth';

const STORAGE_KEY_TOKEN = 'sentinel_jwt_token';
const STORAGE_KEY_USER = 'sentinel_user_profile';
const STORAGE_KEY_REGISTERED_USERS = 'sentinel_registered_accounts';

interface RegisteredAccount {
  id: number;
  email: string;
  passwordHash: string; // Plain/hash for client mock
  role: string;
}

const DEFAULT_DEMO_USER: User = {
  id: 1,
  email: 'sentinel-operator@example.com',
  role: 'ROLE_ADMIN'
};

const DEFAULT_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 1,
    email: 'sentinel-operator@example.com',
    passwordHash: 'Sentinel123!',
    role: 'ROLE_ADMIN'
  }
];

class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;

  constructor() {
    this.init();
    this.seedDefaultAccounts();
  }

  private seedDefaultAccounts() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(DEFAULT_ACCOUNTS));
      }
    } catch {
      // ignore
    }
  }

  private getRegisteredAccounts(): RegisteredAccount[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
      return stored ? JSON.parse(stored) : DEFAULT_ACCOUNTS;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  }

  private saveRegisteredAccount(account: RegisteredAccount) {
    const list = this.getRegisteredAccounts();
    list.push(account);
    localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(list));
  }

  private init() {
    try {
      this.token = localStorage.getItem(STORAGE_KEY_TOKEN);
      const userJson = localStorage.getItem(STORAGE_KEY_USER);
      if (userJson && this.token) {
        this.currentUser = JSON.parse(userJson);
      } else {
        this.token = null;
        this.currentUser = null;
      }
    } catch {
      this.token = null;
      this.currentUser = null;
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public getUser(): User | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser;
  }

  public async login(email: string, password: string): Promise<User> {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Try real backend endpoint if live
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
        signal: AbortSignal.timeout(2000)
      });

      if (res.ok) {
        const data: AuthResponse = await res.json();
        return this.saveSession(data);
      } else if (res.status === 401 || res.status === 400) {
        const errText = await res.text();
        throw new Error(errText || 'Invalid email address or password.');
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('Invalid') || err.message.includes('password'))) {
        throw err;
      }
      // If network timed out / backend not connected, proceed to client store validation
    }

    // 2. Client Mock Authentication Store: Strictly validate against registered accounts!
    const accounts = this.getRegisteredAccounts();
    const account = accounts.find(a => a.email.toLowerCase() === normalizedEmail);

    if (!account) {
      throw new Error(`Account "${normalizedEmail}" does not exist. Please click "Create Account" first.`);
    }

    if (account.passwordHash !== password) {
      throw new Error('Incorrect password. Please verify your credentials.');
    }

    // Valid credentials! Generate authenticated session
    const mockToken = `jwt-sentinel-${account.id}-${Date.now()}`;
    return this.saveSession({
      token: mockToken,
      userId: account.id,
      email: account.email,
      role: account.role
    });
  }

  public async register(email: string, password: string): Promise<User> {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Try real backend endpoint if live
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
        signal: AbortSignal.timeout(2000)
      });

      if (res.ok) {
        const data: AuthResponse = await res.json();
        return this.saveSession(data);
      } else if (res.status === 409) {
        throw new Error(`Email "${normalizedEmail}" is already registered. Please Sign In.`);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('already registered')) {
        throw err;
      }
    }

    // 2. Client Mock Authentication Store: Strictly verify email is unique
    const accounts = this.getRegisteredAccounts();
    if (accounts.some(a => a.email.toLowerCase() === normalizedEmail)) {
      throw new Error(`Email "${normalizedEmail}" is already registered. Please Sign In.`);
    }

    const newAccount: RegisteredAccount = {
      id: Date.now(),
      email: normalizedEmail,
      passwordHash: password,
      role: 'ROLE_USER'
    };
    this.saveRegisteredAccount(newAccount);

    // Save active session for new registered user
    const mockToken = `jwt-sentinel-${newAccount.id}-${Date.now()}`;
    return this.saveSession({
      token: mockToken,
      userId: newAccount.id,
      email: newAccount.email,
      role: newAccount.role
    });
  }

  public async quickDemoLogin(): Promise<User> {
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data: AuthResponse = await res.json();
        return this.saveSession(data);
      }
    } catch {
      // ignore
    }

    // Default operator demo session
    return this.saveSession({
      token: `demo-jwt-token-operator-${Date.now()}`,
      userId: DEFAULT_DEMO_USER.id,
      email: DEFAULT_DEMO_USER.email,
      role: DEFAULT_DEMO_USER.role
    });
  }

  public logout(): void {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
  }

  private saveSession(data: AuthResponse): User {
    this.token = data.token;
    this.currentUser = {
      id: data.userId,
      email: data.email,
      role: data.role
    };

    localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
    return this.currentUser;
  }
}

export const authService = new AuthService();

