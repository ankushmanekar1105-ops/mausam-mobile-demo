/**
 * Mausam Authentication Service
 * 
 * Modular authentication architecture designed to seamlessly interface with
 * Firebase Authentication (createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut).
 * In this isolated frontend demo, local demo persistence is used while retaining the exact
 * Firebase method signatures so real Firebase Auth can be plugged in without changing component logic.
 */

export interface DemoUser {
  uid: string;
  email: string;
  name?: string;
  phone?: string;
  cityId?: string;
  hasCompletedProfile: boolean;
  hasCompletedOnboarding: boolean;
  createdAt: string;
}

const AUTH_STORAGE_KEY = 'mausam_demo_auth_user';
const USERS_DB_KEY = 'mausam_demo_users_db';

// Default initial demo user for instant login testing
const DEFAULT_DEMO_USERS: Record<string, { user: DemoUser; pass: string }> = {
  'ankus@example.com': {
    user: {
      uid: 'usr-demo-1',
      email: 'ankus@example.com',
      name: 'Ankus Sharma',
      phone: '+91 98765 43210',
      cityId: 'delhi',
      hasCompletedProfile: true,
      hasCompletedOnboarding: true,
      createdAt: new Date().toISOString(),
    },
    pass: 'password123',
  },
};

function getStoredUsersDb(): Record<string, { user: DemoUser; pass: string }> {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEFAULT_DEMO_USERS));
      return DEFAULT_DEMO_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DEMO_USERS;
  }
}

function saveUsersDb(db: Record<string, { user: DemoUser; pass: string }>) {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to persist demo user database', e);
  }
}

export function getCurrentUser(): DemoUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: DemoUser | null) {
  try {
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Failed to persist active auth session', e);
  }
}

/**
 * Sign In with Email & Password (matching Firebase signInWithEmailAndPassword signature)
 */
export async function signInWithEmailAndPassword(
  email: string,
  pass: string
): Promise<{ user: DemoUser }> {
  // Simulate network roundtrip latency
  await new Promise((resolve) => setTimeout(resolve, 250));

  const trimmedEmail = email.trim().toLowerCase();
  const db = getStoredUsersDb();
  const entry = db[trimmedEmail];

  if (!entry) {
    // If not found in demo DB, create temporary entry if email format is valid
    if (trimmedEmail.includes('@') && pass.length >= 6) {
      const newUser: DemoUser = {
        uid: `usr-${Date.now()}`,
        email: trimmedEmail,
        hasCompletedProfile: false,
        hasCompletedOnboarding: false,
        createdAt: new Date().toISOString(),
      };
      db[trimmedEmail] = { user: newUser, pass };
      saveUsersDb(db);
      saveCurrentUser(newUser);
      return { user: newUser };
    }
    throw new Error('User not found. Please check your email or click "Create Account".');
  }

  if (entry.pass !== pass) {
    throw new Error('Incorrect password. Please try again or use "Forgot Password".');
  }

  saveCurrentUser(entry.user);
  return { user: entry.user };
}

/**
 * Create User with Email & Password (matching Firebase createUserWithEmailAndPassword signature)
 */
export async function createUserWithEmailAndPassword(
  email: string,
  pass: string
): Promise<{ user: DemoUser }> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  if (!pass || pass.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const db = getStoredUsersDb();
  if (db[trimmedEmail]) {
    throw new Error('An account with this email already exists. Please sign in instead.');
  }

  const newUser: DemoUser = {
    uid: `usr-${Date.now()}`,
    email: trimmedEmail,
    hasCompletedProfile: false,
    hasCompletedOnboarding: false,
    createdAt: new Date().toISOString(),
  };

  db[trimmedEmail] = { user: newUser, pass };
  saveUsersDb(db);
  saveCurrentUser(newUser);

  return { user: newUser };
}

/**
 * Update Profile metadata for current user
 */
export function updateUserProfile(
  updates: Partial<Pick<DemoUser, 'name' | 'phone' | 'cityId' | 'hasCompletedProfile' | 'hasCompletedOnboarding'>>
): DemoUser | null {
  const current = getCurrentUser();
  if (!current) return null;

  const updated: DemoUser = { ...current, ...updates };
  saveCurrentUser(updated);

  const db = getStoredUsersDb();
  if (db[updated.email]) {
    db[updated.email].user = updated;
    saveUsersDb(db);
  }

  return updated;
}

/**
 * Sign Out (matching Firebase signOut signature)
 */
export async function signOut(): Promise<void> {
  saveCurrentUser(null);
}
