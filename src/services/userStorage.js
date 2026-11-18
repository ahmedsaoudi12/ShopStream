
const USERS_KEY = 'shopstream_admin_users';
const DELETED_USERS_KEY = 'shopstream_deleted_users';

const getUsers = () => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to read saved users:', error);
    return [];
  }
};

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const getDeletedUserIds = () => {
  try {
    const data = localStorage.getItem(DELETED_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to read deleted users:', error);
    return [];
  }
};

export const userStorage = {
  getUsers,

  getDeletedUserIds,

  addUser(user) {
    const users = getUsers();
    const updatedUsers = [user, ...users];

    saveUsers(updatedUsers);

    const deletedIds = getDeletedUserIds().filter(
      (id) => String(id) !== String(user.id)
    );

    localStorage.setItem(
      DELETED_USERS_KEY,
      JSON.stringify(deletedIds)
    );

    return updatedUsers;
  },

  updateUser(updatedUser) {
    const users = getUsers();

    const exists = users.some(
      (user) => String(user.id) === String(updatedUser.id)
    );

    const updatedUsers = exists
      ? users.map((user) =>
          String(user.id) === String(updatedUser.id)
            ? updatedUser
            : user
        )
      : [updatedUser, ...users];

    saveUsers(updatedUsers);
    return updatedUsers;
  },

  deleteUser(userId) {
    const users = getUsers();

    const updatedUsers = users.filter(
      (user) => String(user.id) !== String(userId)
    );

    saveUsers(updatedUsers);

    const deletedIds = getDeletedUserIds();

    if (
      !deletedIds.some(
        (id) => String(id) === String(userId)
      )
    ) {
      deletedIds.push(userId);
    }

    localStorage.setItem(
      DELETED_USERS_KEY,
      JSON.stringify(deletedIds)
    );

    return updatedUsers;
  },
};
