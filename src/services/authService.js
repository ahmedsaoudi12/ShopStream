
import api from './api';
import { storage } from '../utils/storage';
import { userStorage } from './userStorage';

// Demo admin accounts.
const ADMIN_ACCOUNTS = [
  {
    id: 'admin_1',
    username: 'admin1',
    password: 'Admin123',
    firstName: 'Admin',
    lastName: 'One',
    email: 'admin1@shopstream.demo',
  },
  {
    id: 'admin_2',
    username: 'admin2',
    password: 'Admin456',
    firstName: 'Admin',
    lastName: 'Two',
    email: 'admin2@shopstream.demo',
  },
  {
    id: 'admin_3',
    username: 'admin3',
    password: 'Admin789',
    firstName: 'Admin',
    lastName: 'Three',
    email: 'admin3@shopstream.demo',
  },
];

// Hash passwords for locally registered customer accounts.
async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function createSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function createToken() {
  return `local_${crypto.randomUUID()}`;
}

function getPublicUser(user) {
  const publicUser = { ...user };

  delete publicUser.passwordHash;
  delete publicUser.passwordSalt;
  delete publicUser.password;

  return publicUser;
}

function getLoginError(error) {
  const serverMessage = error?.response?.data?.message;

  if (serverMessage) {
    const normalizedMessage = serverMessage.toLowerCase();

    if (
      normalizedMessage.includes('invalid credentials') ||
      normalizedMessage.includes('username or password')
    ) {
      return 'Incorrect username or password. Please try again.';
    }

    return serverMessage;
  }

  if (error?.response) {
    return 'Login failed. Please check your username and password.';
  }

  if (error?.request) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  return error?.message || 'Something went wrong. Please try again.';
}

const authService = {
  async login(credentials) {
    const identifier = credentials.username.trim().toLowerCase();

    // 1. Check demo admin accounts.
    const adminAccount = ADMIN_ACCOUNTS.find(
      (admin) =>
        admin.username.toLowerCase() === identifier ||
        admin.email.toLowerCase() === identifier
    );

    if (adminAccount) {
      if (credentials.password !== adminAccount.password) {
        throw new Error(
          'Incorrect username or password. Please try again.'
        );
      }

      return {
        id: adminAccount.id,
        username: adminAccount.username,
        firstName: adminAccount.firstName,
        lastName: adminAccount.lastName,
        email: adminAccount.email,
        role: 'admin',
        image: '',
        accessToken: createToken(),
      };
    }

    // 2. Check locally registered customers.
    const registeredUsers = storage.getRegisteredUsers();

    const localUser = registeredUsers.find(
      (user) =>
        user.username?.toLowerCase() === identifier ||
        user.email?.toLowerCase() === identifier
    );

    if (localUser) {
      const enteredHash = await hashPassword(
        credentials.password,
        localUser.passwordSalt
      );

      if (enteredHash !== localUser.passwordHash) {
        throw new Error(
          'Incorrect username or password. Please try again.'
        );
      }

      return {
        ...getPublicUser(localUser),
        role: 'customer',
        accessToken: createToken(),
      };
    }

    // 3. Try DummyJSON demo accounts.
    try {
      let username = credentials.username.trim();

      if (username.includes('@')) {
        const response = await api.get('/users/filter', {
          params: {
            key: 'email',
            value: username,
          },
        });

        const matchedUser = response.data.users?.[0];

        if (!matchedUser) {
          throw new Error(
            'No account found with this email address.'
          );
        }

        username = matchedUser.username;
      }

      const response = await api.post('/auth/login', {
        username,
        password: credentials.password,
        expiresInMins: credentials.rememberMe ? 43200 : 60,
      });

      return {
        ...response.data,
        role: 'customer',
      };
    } catch (error) {
      if (error instanceof Error && !error.response) {
        throw error;
      }

      throw new Error(getLoginError(error), {
        cause: error,
      });
    }
  },

  async getCurrentUser() {
    const token = storage.getToken();

    // Restore locally registered customers and demo admins.
    if (token?.startsWith('local_')) {
      const user = storage.getUser();

      if (!user) {
        throw new Error('Local session not found.');
      }

      return {
        ...user,
        role: user.role || 'customer',
      };
    }

    // Restore DummyJSON customer session.
    const response = await api.get('/auth/me');

    return {
      ...response.data,
      role: 'customer',
    };
  },

  async register(userData) {
    const registeredUsers = storage.getRegisteredUsers();

    const email = userData.email.trim().toLowerCase();
    const username = userData.username.trim().toLowerCase();

    const emailExists = registeredUsers.some(
      (user) => user.email?.toLowerCase() === email
    );

    if (emailExists) {
      throw new Error('This email is already registered.');
    }

    const usernameExists = registeredUsers.some(
      (user) => user.username?.toLowerCase() === username
    );

    if (usernameExists) {
      throw new Error('This username is already taken.');
    }

    // Prevent registering with reserved admin credentials.
    const isReservedAdminAccount = ADMIN_ACCOUNTS.some(
      (admin) =>
        admin.username.toLowerCase() === username ||
        admin.email.toLowerCase() === email
    );

    if (isReservedAdminAccount) {
      throw new Error('This username or email is reserved.');
    }

    const nameParts = userData.fullName.trim().split(/\s+/);
    const firstName = nameParts.shift() || '';
    const lastName = nameParts.join(' ');

    const passwordSalt = createSalt();

    const passwordHash = await hashPassword(
      userData.password,
      passwordSalt
    );

    const newUser = {
      id: `local_${Date.now()}`,
      firstName,
      lastName,
      name: userData.fullName.trim(),
      username: userData.username.trim(),
      email: userData.email.trim(),
      image: '',
      role: 'customer',
      gender: '',
      phone: '',
      age: null,
      createdAt: new Date().toISOString(),
      passwordSalt,
      passwordHash,
      isLocalAccount: true,
    };

    // Save the full account securely for future login.
    storage.setRegisteredUsers([
      ...registeredUsers,
      newUser,
    ]);

    // Add only public user information to Admin Users Management.
    userStorage.addUser(getPublicUser(newUser));

    return getPublicUser(newUser);
  },
};

export default authService;
