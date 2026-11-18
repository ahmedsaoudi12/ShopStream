
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import api from '../../../services/api';
import { userStorage } from '../../../services/userStorage';
import { storage } from '../../../utils/storage';

import './UsersManagement.css';

const USERS_PER_PAGE = 8;

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  username: '',
  age: '',
  gender: 'male',
};

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Load users from DummyJSON and merge local changes
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const response = await api.get('/users?limit=0');
        const apiUsers = response.data.users || [];

        const savedUsers = userStorage.getUsers();
        const deletedIds = userStorage.getDeletedUserIds();

        const deletedSet = new Set(
          deletedIds.map((id) => String(id))
        );

        const savedIds = new Set(
          savedUsers.map((user) => String(user.id))
        );

        // Exclude deleted users and replace API users with saved versions
        const remainingApiUsers = apiUsers.filter(
          (user) =>
            !deletedSet.has(String(user.id)) &&
            !savedIds.has(String(user.id))
        );

        setUsers([...savedUsers, ...remainingApiUsers]);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setUsers(userStorage.getUsers());
        toast.error('Could not load users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Search users by name, email, username, ID, or phone
  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) return users;

    return users.filter((user) => {
      const fullName =
        `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();

      return (
        fullName.includes(searchValue) ||
        user.email?.toLowerCase().includes(searchValue) ||
        user.username?.toLowerCase().includes(searchValue) ||
        String(user.id).toLowerCase().includes(searchValue) ||
        user.phone?.toLowerCase().includes(searchValue)
      );
    });
  }, [users, search]);

  // Calculate pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PER_PAGE)
  );

  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  // Calculate user statistics
  const totalUsers = users.length;

  const maleUsers = users.filter(
    (user) => user.gender === 'male'
  ).length;

  const femaleUsers = users.filter(
    (user) => user.gender === 'female'
  ).length;

  // Open add user modal
  const handleAddClick = () => {
    setEditingUser(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  // Open edit user modal
  const handleEditClick = (user) => {
    setEditingUser(user);

    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      username: user.username || '',
      age: user.age ?? '',
      gender: user.gender || 'male',
    });

    setShowModal(true);
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingUser(null);
    setFormData(emptyForm);
  };

  // Handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Add or update a user
  const handleSubmit = async (event) => {
    event.preventDefault();

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim().toLowerCase();
    const username = formData.username.trim();

    if (!firstName || !lastName || !email || !username) {
      toast.error('Please fill in all required fields.');
      return;
    }

    // Prevent duplicate email addresses
    const emailExists = users.some(
      (user) =>
        user.email?.toLowerCase() === email &&
        String(user.id) !== String(editingUser?.id)
    );

    if (emailExists) {
      toast.error('This email is already registered.');
      return;
    }

    // Prevent duplicate usernames
    const usernameExists = users.some(
      (user) =>
        user.username?.toLowerCase() === username.toLowerCase() &&
        String(user.id) !== String(editingUser?.id)
    );

    if (usernameExists) {
      toast.error('This username is already taken.');
      return;
    }

    const userData = {
      ...formData,
      firstName,
      lastName,
      email,
      username,
      age: formData.age === '' ? null : Number(formData.age),
    };

    if (
      userData.age !== null &&
      (!Number.isFinite(userData.age) ||
        userData.age < 1 ||
        userData.age > 120)
    ) {
      toast.error('Please enter a valid age.');
      return;
    }

    try {
      setSaving(true);

      if (editingUser) {
        // Update the user in admin storage
        const updatedUser = {
          ...editingUser,
          ...userData,
        };

        userStorage.updateUser(updatedUser);

        // Sync changes with the original registered customer account
        storage.updateRegisteredUser(
          updatedUser.id,
          updatedUser
        );

        // Update the displayed users list
        setUsers((previousUsers) =>
          previousUsers.map((user) =>
            String(user.id) === String(editingUser.id)
              ? updatedUser
              : user
          )
        );

        toast.success('User updated successfully!');
      } else {
        // DummyJSON does not permanently save new users
        // Create a unique local user ID
        const newUser = {
          id: `local-${Date.now()}`,
          ...userData,
          image: '',
          role: 'user',
        };

        // Save the new user locally
        userStorage.addUser(newUser);

        setUsers((previousUsers) => [
          newUser,
          ...previousUsers,
        ]);

        setSearch('');
        setCurrentPage(1);

        toast.success('User added successfully!');
      }

      // Close modal after successful operation
      setShowModal(false);
      setEditingUser(null);
      setFormData(emptyForm);
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error('Something went wrong while saving the user.');
    } finally {
      setSaving(false);
    }
  };

  // Delete user after confirmation
  const handleDeleteUser = (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.firstName} ${user.lastName}?`
    );

    if (!confirmed) return;

    // Delete the user from admin storage
    userStorage.deleteUser(user.id);

    // Delete the original local registered account if it exists
    storage.deleteRegisteredUser(user.id);

    // Remove user from the displayed list
    setUsers((previousUsers) =>
      previousUsers.filter(
        (item) => String(item.id) !== String(user.id)
      )
    );

    // Keep the current page valid after deletion
    setCurrentPage((previousPage) =>
      Math.min(
        previousPage,
        Math.max(
          1,
          Math.ceil(
            (filteredUsers.length - 1) / USERS_PER_PAGE
          )
        )
      )
    );

    toast.success('User deleted successfully!');
  };

  // Display user initials
  const getInitials = (user) => {
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <section className="users-management">
      {/* Page heading */}
      <div className="users-page-heading">
        <div>
          <h2>User Directory</h2>
          <p>Manage your customers and their account information.</p>
        </div>

        <button
          type="button"
          className="users-add-button"
          onClick={handleAddClick}
        >
          <span>＋</span> Add New User
        </button>
      </div>

      {/* User statistics */}
      <div className="users-stats-grid">
        <div className="users-stat-card">
          <div className="users-stat-icon total-users-icon">♙</div>
          <div>
            <span>TOTAL USERS</span>
            <strong>{totalUsers.toLocaleString('en-US')}</strong>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon male-users-icon">♂</div>
          <div>
            <span>MALE USERS</span>
            <strong>{maleUsers.toLocaleString('en-US')}</strong>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon female-users-icon">♀</div>
          <div>
            <span>FEMALE USERS</span>
            <strong>{femaleUsers.toLocaleString('en-US')}</strong>
          </div>
        </div>
      </div>

      {/* Search users */}
      <div className="users-toolbar">
        <div className="users-search">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Search by name, email, username, or ID..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <span className="users-results-count">
          {filteredUsers.length} users found
        </span>
      </div>

      {/* Users table */}
      <div className="users-table-card">
        {loading ? (
          <div className="users-state">Loading users...</div>
        ) : (
          <>
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="users-user-cell">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={`${user.firstName} ${user.lastName}`}
                            />
                          ) : (
                            <div className="users-avatar">
                              {getInitials(user)}
                            </div>
                          )}

                          <div>
                            <strong>
                              {user.firstName} {user.lastName}
                            </strong>
                            <span>
                              @{user.username || 'username'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{user.email || '—'}</td>
                      <td>{user.phone || '—'}</td>
                      <td>{user.age ?? '—'}</td>

                      <td>
                        <span
                          className={`users-gender-badge ${
                            user.gender === 'female'
                              ? 'female'
                              : 'male'
                          }`}
                        >
                          {user.gender || '—'}
                        </span>
                      </td>

                      <td>
                        <div className="users-row-actions">
                          <button
                            type="button"
                            title="Edit user"
                            onClick={() => handleEditClick(user)}
                          >
                            ✎
                          </button>

                          <button
                            type="button"
                            title="Delete user"
                            onClick={() => handleDeleteUser(user)}
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {currentUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" className="users-empty">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* User pagination */}
            <div className="users-table-footer">
              <span>
                Showing{' '}
                {filteredUsers.length === 0
                  ? 0
                  : (currentPage - 1) * USERS_PER_PAGE + 1}
                {' '}to{' '}
                {Math.min(
                  currentPage * USERS_PER_PAGE,
                  filteredUsers.length
                )}
                {' '}of {filteredUsers.length} users
              </span>

              <div className="users-pagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => page - 1)
                  }
                >
                  ‹
                </button>

                <span>
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => page + 1)
                  }
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add and edit user modal */}
      {showModal && (
        <div
          className="users-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div
            className="users-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="users-modal-title"
          >
            <div className="users-modal-header">
              <div>
                <h3 id="users-modal-title">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <p>
                  {editingUser
                    ? 'Update the user account information.'
                    : 'Enter the details to create a new user.'}
                </p>
              </div>

              <button
                type="button"
                className="users-modal-close"
                onClick={handleCloseModal}
                disabled={saving}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="users-form-grid">
                <div className="users-form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="users-form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div className="users-form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                  />
                </div>

                <div className="users-form-group">
                  <label htmlFor="username">Username *</label>
                  <input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div className="users-form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="users-form-group">
                  <label htmlFor="age">Age</label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter age"
                  />
                </div>

                <div className="users-form-group users-form-full">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="users-modal-footer">
                <button
                  type="button"
                  className="users-cancel-button"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="users-save-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingUser
                      ? 'Save Changes'
                      : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default UsersManagement;
