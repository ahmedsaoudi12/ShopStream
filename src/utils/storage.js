
const TOKEN_KEY = 'shopstream_token';
const USER_KEY = 'shopstream_user';
const REGISTERED_USERS_KEY = 'shopstream_registered_users';

const readJSON = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const storage = {
  // Read authentication token
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Save authentication token
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Read current logged-in user
  getUser() {
    return readJSON(USER_KEY, null);
  },

  // Save current logged-in user
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Read locally registered customer accounts
  getRegisteredUsers() {
    return readJSON(REGISTERED_USERS_KEY, []);
  },

  // Save registered customer accounts
  setRegisteredUsers(users) {
    localStorage.setItem(
      REGISTERED_USERS_KEY,
      JSON.stringify(users)
    );
  },

  // Update a registered customer's profile without changing password data
  updateRegisteredUser(userId, updatedData) {
    const users = this.getRegisteredUsers();

    const updatedUsers = users.map((user) =>
      String(user.id) === String(userId)
        ? {
            ...user,
            firstName: updatedData.firstName,
            lastName: updatedData.lastName,
            name: `${updatedData.firstName} ${updatedData.lastName}`.trim(),
            email: updatedData.email,
            username: updatedData.username,
            phone: updatedData.phone,
            age: updatedData.age,
            gender: updatedData.gender,
          }
        : user
    );

    this.setRegisteredUsers(updatedUsers);

    // Update the active session if it belongs to this customer
    const currentUser = this.getUser();

    if (
      currentUser &&
      String(currentUser.id) === String(userId)
    ) {
      this.setUser({
        ...currentUser,
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        name: `${updatedData.firstName} ${updatedData.lastName}`.trim(),
        email: updatedData.email,
        username: updatedData.username,
        phone: updatedData.phone,
        age: updatedData.age,
        gender: updatedData.gender,
      });
    }

    return updatedUsers;
  },

  // Delete a registered customer account
  deleteRegisteredUser(userId) {
    const users = this.getRegisteredUsers();

    const updatedUsers = users.filter(
      (user) => String(user.id) !== String(userId)
    );

    this.setRegisteredUsers(updatedUsers);

    // Clear the active session if the deleted customer is logged in
    const currentUser = this.getUser();

    if (
      currentUser &&
      String(currentUser.id) === String(userId)
    ) {
      this.clearAuth();
    }

    return updatedUsers;
  },

  // Clear authentication data
  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
