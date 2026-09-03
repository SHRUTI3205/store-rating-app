import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function initials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function roleLabel(role) {
  if (role === "admin") return "System Administrator";
  if (role === "store_owner") return "Store Owner";
  return "Normal User";
}

function Stars({ value = 0, size = "18px" }) {
  const rating = Number(value) || 0;

  return (
    <span className="stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= Math.round(rating)
              ? "star-filled"
              : "star-empty"
          }
        >
          ★
        </span>
      ))}
    </span>
  );
}

function Header({ user, onLogout }) {
  return (
    <header className="top-header">
      <div className="brand-area">
        <div className="brand-icon">★</div>

        <div>
          <div className="brand-name">StoreRate</div>
          <div className="brand-tagline">
            Rate. Discover. Share.
          </div>
        </div>
      </div>

      {user && (
        <div className="header-user">
          <div className="header-avatar">
            {initials(user.name)}
          </div>

          <div className="header-user-info">
            <strong>{user.name}</strong>
            <span>{roleLabel(user.role)}</span>
          </div>

          <button
            className="header-logout"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

function Sidebar({
  user,
  activePage,
  setActivePage,
  onLogout,
}) {
  if (!user) return null;

  const adminItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "users", icon: "👥", label: "Users" },
    { id: "stores", icon: "🏪", label: "Stores" },
    { id: "ratings", icon: "⭐", label: "Ratings" },
  ];

  const userItems = [
    { id: "stores", icon: "🏪", label: "Stores" },
    { id: "password", icon: "🔐", label: "Update Password" },
  ];

  const ownerItems = [
    {
      id: "owner-dashboard",
      icon: "📊",
      label: "Dashboard",
    },
    {
      id: "password",
      icon: "🔐",
      label: "Update Password",
    },
  ];

  const items =
    user.role === "admin"
      ? adminItems
      : user.role === "store_owner"
      ? ownerItems
      : userItems;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${
              activePage === item.id ? "active" : ""
            }`}
            onClick={() => setActivePage(item.id)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <button
          className="sidebar-item logout-item"
          onClick={onLogout}
        >
          <span>↪</span>
          Logout
        </button>
      </nav>
    </aside>
  );
}

function Layout({
  user,
  activePage,
  setActivePage,
  onLogout,
  children,
}) {
  return (
    <div className="app-shell">
      <Header user={user} onLogout={onLogout} />

      <div className="dashboard-layout">
        <Sidebar
          user={user}
          activePage={activePage}
          setActivePage={setActivePage}
          onLogout={onLogout}
        />

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

function HomePage({ stores, onLogin, onRegister }) {
  return (
    <div className="public-page">
      <header className="public-header">
        <div className="brand-area">
          <div className="brand-icon">★</div>

          <div>
            <div className="brand-name">StoreRate</div>
            <div className="brand-tagline">
              Rate. Discover. Share.
            </div>
          </div>
        </div>

        <div className="public-actions">
          <button
            className="outline-button"
            onClick={onLogin}
          >
            Login
          </button>

          <button
            className="white-button"
            onClick={onRegister}
          >
            Register
          </button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-left">
          <div className="hero-badge">
            ★ Trusted Store Reviews
          </div>

          <h1>
            Discover stores.
            <br />
            <span>Share your experience.</span>
          </h1>

          <p>
            Explore registered stores and help others
            make better decisions by sharing your honest
            rating.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-button"
              onClick={onLogin}
            >
              Start Rating →
            </button>

            <button
              className="secondary-button"
              onClick={onRegister}
            >
              Create Account
            </button>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-icon">⭐</div>

          <h2>Rate your experience</h2>

          <p>
            Give stores a rating from 1 to 5 stars and see
            what other customers think.
          </p>

          <div className="hero-stars">★★★★★</div>
        </div>
      </section>

      <section className="public-stores-section">
        <div className="section-heading-row">
          <div>
            <div className="section-label">EXPLORE</div>
            <h2>Available Stores</h2>
          </div>

          <span className="count-pill">
            {stores.length} stores
          </span>
        </div>

        <div className="public-store-grid">
          {stores.map((store) => (
            <div
              className="public-store-card"
              key={store.id}
            >
              <div className="store-letter">
                {initials(store.name).slice(0, 1)}
              </div>

              <div className="public-store-info">
                <h3>{store.name}</h3>

                <p>📍 {store.address}</p>

                <div className="rating-line">
                  <Stars
                    value={
                      store.average_rating ||
                      store.rating
                    }
                  />

                  <strong>
                    {Number(
                      store.average_rating ||
                        store.rating ||
                        0
                    ).toFixed(1)}
                  </strong>

                  <span>
                    (
                    {store.total_ratings ||
                      store.rating_count ||
                      0}{" "}
                    ratings)
                  </span>
                </div>
              </div>
            </div>
          ))}

          {stores.length === 0 && (
            <div className="empty-state">
              No stores available.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function LoginPage({
  onLogin,
  onRegister,
  onBack,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Login failed"
        );
        return;
      }

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      onLogin(data.user);
    } catch (error) {
      console.error(error);
      alert(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button
          className="back-link"
          onClick={onBack}
        >
          ← Back to Home
        </button>

        <div className="auth-icon">★</div>

        <div className="section-label">
          WELCOME BACK
        </div>

        <h1>Login to StoreRate</h1>

        <p>
          Access your personalized store rating
          dashboard.
        </p>

        <form
          onSubmit={submit}
          className="auth-form"
        >
          <label>Email Address</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          <button
            className="primary-button full-width"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?

          <button onClick={onRegister}>
            Create one
          </button>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({
  onRegistered,
  onLogin,
  onBack,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    if (
      name.length < 20 ||
      name.length > 60
    ) {
      alert(
        "Name must be between 20 and 60 characters."
      );
      return;
    }

    if (address.length > 400) {
      alert(
        "Address cannot exceed 400 characters."
      );
      return;
    }

    if (
      password.length < 8 ||
      password.length > 16
    ) {
      alert(
        "Password must be between 8 and 16 characters."
      );
      return;
    }

    if (!/[A-Z]/.test(password)) {
      alert(
        "Password must contain at least one uppercase letter."
      );
      return;
    }

    if (
      !/[!@#$%^&*(),.?":{}|<>[\]\\\/;'`~+=_-]/.test(
        password
      )
    ) {
      alert(
        "Password must contain at least one special character."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            address,
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Registration failed."
        );
        return;
      }

      alert(
        "Registration successful! Please login."
      );

      onRegistered();
    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <button
          className="back-link"
          onClick={onBack}
        >
          ← Back to Home
        </button>

        <div className="auth-icon">✦</div>

        <div className="section-label">
          JOIN STORERATE
        </div>

        <h1>Create your account</h1>

        <p>
          Sign up to discover and rate registered
          stores.
        </p>

        <form
          onSubmit={submit}
          className="auth-form"
        >
          <label>Full Name</label>

          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            minLength={20}
            maxLength={60}
            onChange={(event) =>
              setName(event.target.value)
            }
            required
          />

          <small>
            {name.length}/60 characters
          </small>

          <label>Email Address</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <label>Address</label>

          <textarea
            placeholder="Enter your address"
            value={address}
            maxLength={400}
            onChange={(event) =>
              setAddress(
                event.target.value
              )
            }
            required
          />

          <small>
            {address.length}/400 characters
          </small>

          <label>Password</label>

          <input
            type="password"
            placeholder="8–16 characters"
            value={password}
            minLength={8}
            maxLength={16}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            required
          />

          <div className="password-hint">
            <span>
              ✓ 8–16 characters
            </span>

            <span>
              ✓ One uppercase letter
            </span>

            <span>
              ✓ One special character
            </span>
          </div>

          <button
            className="primary-button full-width"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?

          <button onClick={onLogin}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

function PageHeader({
  label,
  title,
  subtitle,
  children,
}) {
  return (
    <div className="page-header">
      <div>
        <div className="section-label">
          {label}
        </div>

        <h1>{title}</h1>

        <p>{subtitle}</p>
      </div>

      {children}
    </div>
  );
}

function AdminDashboard({
  stats,
  users,
  stores,
  ratings,
  setActivePage,
}) {
  return (
    <PageHeader
      label="SYSTEM ADMINISTRATOR"
      title="Dashboard"
      subtitle="Overview of your store rating platform."
    >
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>

          <div>
            <span>Total Users</span>
            <strong>{stats.users}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏪</div>

          <div>
            <span>Total Stores</span>
            <strong>{stats.stores}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>

          <div>
            <span>Submitted Ratings</span>
            <strong>{stats.ratings}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-columns">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Users</h2>
              <p>Registered platform users</p>
            </div>

            <button
              className="text-button"
              onClick={() =>
                setActivePage("users")
              }
            >
              View All
            </button>
          </div>

          {users.length > 0 ? (
            <div className="mini-list">
              {users
                .slice(0, 5)
                .map((item) => (
                  <div
                    className="mini-list-row"
                    key={item.id}
                  >
                    <div className="mini-avatar">
                      {initials(
                        item.name
                      ).slice(0, 1)}
                    </div>

                    <div className="mini-user-info">
                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        {item.email}
                      </span>
                    </div>

                    <span
                      className={
                        item.role ===
                        "store_owner"
                          ? "role-badge owner"
                          : item.role ===
                            "admin"
                          ? "role-badge admin"
                          : "role-badge user"
                      }
                    >
                      {roleLabel(
                        item.role
                      )}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="empty-state">
              No users found.
            </div>
          )}
        </div>

        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Stores</h2>
              <p>
                Registered stores and ratings
              </p>
            </div>

            <button
              className="text-button"
              onClick={() =>
                setActivePage("stores")
              }
            >
              View All
            </button>
          </div>

          {stores.length > 0 ? (
            <div className="mini-list">
              {stores
                .slice(0, 5)
                .map((store) => {
                  const rating =
                    Number(
                      store.average_rating ||
                        store.rating ||
                        store.overall_rating ||
                        0
                    );

                  return (
                    <div
                      className="mini-list-row"
                      key={store.id}
                    >
                      <div className="store-mini-icon">
                        🏪
                      </div>

                      <div className="mini-user-info">
                        <strong>
                          {store.name}
                        </strong>

                        <span>
                          {store.address}
                        </span>
                      </div>

                      <div className="mini-rating">
                        <Stars
                          value={rating}
                          size="14px"
                        />

                        <strong>
                          {rating.toFixed(
                            1
                          )}
                        </strong>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="empty-state">
              No stores found.
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h2>Recent Ratings</h2>
            <p>Latest user submissions</p>
          </div>

          <button
            className="text-button"
            onClick={() =>
              setActivePage("ratings")
            }
          >
            View All
          </button>
        </div>

        {ratings.length > 0 ? (
          <div className="recent-ratings-list">
            {ratings
              .slice(0, 5)
              .map((rating) => (
                <div
                  className="recent-rating-row"
                  key={rating.id}
                >
                  <div>
                    <strong>
                      {rating.user_name}
                    </strong>

                    <span>
                      rated{" "}
                      {rating.store_name}
                    </span>
                  </div>

                  <div className="rating-line">
                    <Stars
                      value={
                        rating.rating
                      }
                    />

                    <strong>
                      {rating.rating}/5
                    </strong>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="empty-state">
            No ratings submitted yet.
          </div>
        )}
      </div>
    </PageHeader>
  );
}
function AdminUsersPage({
  users,
  onRefresh,
  onViewUser,
  onAddUser,
}) {
  const [nameFilter, setNameFilter] =
    useState("");

  const [emailFilter, setEmailFilter] =
    useState("");

  const [addressFilter, setAddressFilter] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("");

  const [sortField, setSortField] =
    useState("name");

  const [sortDirection, setSortDirection] =
    useState("asc");

  const filteredUsers = useMemo(() => {
    let result = users.filter((user) => {
      return (
        String(user.name || "")
          .toLowerCase()
          .includes(
            nameFilter.toLowerCase()
          ) &&
        String(user.email || "")
          .toLowerCase()
          .includes(
            emailFilter.toLowerCase()
          ) &&
        String(user.address || "")
          .toLowerCase()
          .includes(
            addressFilter.toLowerCase()
          ) &&
        (!roleFilter ||
          user.role === roleFilter)
      );
    });

    result.sort((a, b) => {
      const first = String(
        a[sortField] || ""
      ).toLowerCase();

      const second = String(
        b[sortField] || ""
      ).toLowerCase();

      if (first < second) {
        return sortDirection === "asc"
          ? -1
          : 1;
      }

      if (first > second) {
        return sortDirection === "asc"
          ? 1
          : -1;
      }

      return 0;
    });

    return result;
  }, [
    users,
    nameFilter,
    emailFilter,
    addressFilter,
    roleFilter,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <PageHeader
      label="SYSTEM ADMINISTRATOR"
      title="User Management"
      subtitle="View, filter and manage registered users."
    >
      <div className="page-actions">
        <button
          className="secondary-button"
          onClick={onRefresh}
        >
          ↻ Refresh
        </button>

        <button
          className="primary-button"
          onClick={onAddUser}
        >
          + Add User
        </button>
      </div>

      <div className="filter-panel">
        <div className="filter-title">
          🔎 Filters
        </div>

        <div className="filter-grid">
          <input
            placeholder="Filter by name"
            value={nameFilter}
            onChange={(event) =>
              setNameFilter(
                event.target.value
              )
            }
          />

          <input
            placeholder="Filter by email"
            value={emailFilter}
            onChange={(event) =>
              setEmailFilter(
                event.target.value
              )
            }
          />

          <input
            placeholder="Filter by address"
            value={addressFilter}
            onChange={(event) =>
              setAddressFilter(
                event.target.value
              )
            }
          />

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(
                event.target.value
              )
            }
          >
            <option value="">
              All Roles
            </option>

            <option value="user">
              Normal User
            </option>

            <option value="admin">
              Administrator
            </option>

            <option value="store_owner">
              Store Owner
            </option>
          </select>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>
                  <button
                    className="sort-button"
                    onClick={() =>
                      handleSort("name")
                    }
                  >
                    Name{" "}
                    {sortField === "name" &&
                      (sortDirection ===
                      "asc"
                        ? "↑"
                        : "↓")}
                  </button>
                </th>

                <th>
                  <button
                    className="sort-button"
                    onClick={() =>
                      handleSort("email")
                    }
                  >
                    Email{" "}
                    {sortField === "email" &&
                      (sortDirection ===
                      "asc"
                        ? "↑"
                        : "↓")}
                  </button>
                </th>

                <th>Address</th>

                <th>
                  <button
                    className="sort-button"
                    onClick={() =>
                      handleSort("role")
                    }
                  >
                    Role{" "}
                    {sortField === "role" &&
                      (sortDirection ===
                      "asc"
                        ? "↑"
                        : "↓")}
                  </button>
                </th>

                <th>Owner Rating</th>

                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="table-user">
                      <div className="mini-avatar">
                        {initials(
                          user.name
                        ).slice(0, 1)}
                      </div>

                      <strong>
                        {user.name}
                      </strong>
                    </div>
                  </td>

                  <td>{user.email}</td>

                  <td>
                    {user.address ||
                      "Not provided"}
                  </td>

                  <td>
                    <span
                      className={
                        user.role ===
                        "store_owner"
                          ? "role-badge owner"
                          : user.role ===
                            "admin"
                          ? "role-badge admin"
                          : "role-badge user"
                      }
                    >
                      {roleLabel(
                        user.role
                      )}
                    </span>
                  </td>

                  <td>
                    {user.role ===
                    "store_owner" ? (
                      <strong>
                        ⭐{" "}
                        {Number(
                          user.owner_rating ||
                            0
                        ).toFixed(1)}
                      </strong>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td>
                    <button
                      className="view-button"
                      onClick={() =>
                        onViewUser(
                          user.id
                        )
                      }
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            No users match the selected
            filters.
          </div>
        )}
      </div>
    </PageHeader>
  );
}

function AdminRatingsPage({ ratings }) {
  const [search, setSearch] =
    useState("");

  const [sortDirection, setSortDirection] =
    useState("desc");

  const filteredRatings = useMemo(() => {
    let result = ratings.filter(
      (rating) => {
        const query =
          search.toLowerCase();

        return (
          String(
            rating.user_name || ""
          )
            .toLowerCase()
            .includes(query) ||
          String(
            rating.store_name || ""
          )
            .toLowerCase()
            .includes(query)
        );
      }
    );

    result.sort((a, b) => {
      const first =
        Number(a.rating) || 0;

      const second =
        Number(b.rating) || 0;

      return sortDirection === "desc"
        ? second - first
        : first - second;
    });

    return result;
  }, [
    ratings,
    search,
    sortDirection,
  ]);

  return (
    <PageHeader
      label="SYSTEM ADMINISTRATOR"
      title="Ratings"
      subtitle="View all ratings submitted by users."
    >
      <div className="search-box">
        <span>🔎</span>

        <input
          placeholder="Search by user or store..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />

        <button
          className="sort-rating-button"
          onClick={() =>
            setSortDirection(
              sortDirection === "desc"
                ? "asc"
                : "desc"
            )
          }
        >
          Rating{" "}
          {sortDirection === "desc"
            ? "↓"
            : "↑"}
        </button>
      </div>

      <div className="dashboard-panel">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Store</th>
                <th>Rating</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredRatings.map(
                (rating) => (
                  <tr key={rating.id}>
                    <td>
                      <div className="table-user">
                        <div className="mini-avatar">
                          {initials(
                            rating.user_name
                          ).slice(0, 1)}
                        </div>

                        <strong>
                          {
                            rating.user_name
                          }
                        </strong>
                      </div>
                    </td>

                    <td>
                      {
                        rating.user_email
                      }
                    </td>

                    <td>
                      {
                        rating.store_name
                      }
                    </td>

                    <td>
                      <div className="rating-line">
                        <Stars
                          value={
                            rating.rating
                          }
                        />

                        <strong>
                          {
                            rating.rating
                          }
                          /5
                        </strong>
                      </div>
                    </td>

                    <td>
                      {rating.created_at
                        ? new Date(
                            rating.created_at
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {filteredRatings.length ===
          0 && (
          <div className="empty-state">
            No ratings found.
          </div>
        )}
      </div>
    </PageHeader>
  );
}

function UserStoresPage({
  stores,
  onRefresh,
}) {
  const [search, setSearch] =
    useState("");

  const [
    selectedRatings,
    setSelectedRatings,
  ] = useState({});

  const [
    savingId,
    setSavingId,
  ] = useState(null);

  const filteredStores = useMemo(() => {
    const query =
      search.toLowerCase();

    return stores.filter(
      (store) =>
        String(
          store.name || ""
        )
          .toLowerCase()
          .includes(query) ||
        String(
          store.address || ""
        )
          .toLowerCase()
          .includes(query)
    );
  }, [stores, search]);

  const submitRating = async (
    storeId
  ) => {
    const rating = Number(
      selectedRatings[storeId]
    );

    if (
      !rating ||
      rating < 1 ||
      rating > 5
    ) {
      alert(
        "Please select a rating from 1 to 5."
      );
      return;
    }

    setSavingId(storeId);

    try {
      const response =
        await fetch(
          `${API_URL}/ratings`,
          {
            method: "POST",
            headers:
              authHeaders(),
            body: JSON.stringify({
              store_id: storeId,
              rating,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to submit rating."
        );
        return;
      }

      alert(
        "Rating submitted successfully."
      );

      setSelectedRatings(
        (previous) => ({
          ...previous,
          [storeId]: "",
        })
      );

      onRefresh();
    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to the server."
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <PageHeader
      label="USER DASHBOARD"
      title="Find & Rate Stores"
      subtitle="Discover stores and share your experience with the community."
    >
      <div className="search-box">
        <span>🔎</span>

        <input
          type="text"
          placeholder="Search stores by name or address..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />
      </div>

      <div className="store-list">
        {filteredStores.map((store) => {
          const overall =
            Number(
              store.average_rating ||
                store.rating ||
                0
            );

          const userRating =
            Number(
              store.user_rating ||
                store.my_rating ||
                0
            );

          return (
            <div
              className="user-store-card"
              key={store.id}
            >
              <div className="user-store-main">
                <div className="store-letter large">
                  {initials(
                    store.name
                  ).slice(0, 1)}
                </div>

                <div className="user-store-details">
                  <h2>
                    {store.name}
                  </h2>

                  <p>
                    📍 {store.address}
                  </p>

                  <div className="rating-line">
                    <Stars
                      value={overall}
                    />

                    <strong>
                      {overall.toFixed(1)}
                    </strong>

                    <span>
                      {store.total_ratings ||
                        store.rating_count ||
                        0}{" "}
                      ratings
                    </span>
                  </div>
                </div>
              </div>

              <div className="rating-action">
                <span className="action-label">
                  {userRating
                    ? "Your Rating"
                    : "Rate this store"}
                </span>

                <div className="rating-stars-selector">
                  {[1, 2, 3, 4, 5].map(
                    (number) => (
                      <button
                        type="button"
                        key={number}
                        className={
                          number <=
                          Number(
                            selectedRatings[
                              store.id
                            ] ||
                              userRating
                          )
                            ? "rating-star active"
                            : "rating-star"
                        }
                        onClick={() =>
                          setSelectedRatings(
                            (previous) => ({
                              ...previous,
                              [store.id]:
                                number,
                            })
                          )
                        }
                      >
                        ★
                      </button>
                    )
                  )}

                  <button
                    className="primary-button small"
                    onClick={() =>
                      submitRating(
                        store.id
                      )
                    }
                    disabled={
                      savingId ===
                      store.id
                    }
                  >
                    {savingId ===
                    store.id
                      ? "Saving..."
                      : userRating
                      ? "Modify Rating"
                      : "Submit Rating"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredStores.length ===
          0 && (
          <div className="empty-state">
            No stores found.
          </div>
        )}
      </div>
    </PageHeader>
  );
}
function PasswordPage({ user }) {
  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    if (
      newPassword.length < 8 ||
      newPassword.length > 16
    ) {
      alert(
        "Password must be between 8 and 16 characters."
      );
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      alert(
        "Password must contain at least one uppercase letter."
      );
      return;
    }

    if (
      !/[!@#$%^&*(),.?":{}|<>[\]\\\/;'`~+=_-]/.test(
        newPassword
      )
    ) {
      alert(
        "Password must contain at least one special character."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      alert(
        "New passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/update-password`,
          {
            method: "POST",
            headers:
              authHeaders(),
            body: JSON.stringify({
              currentPassword,
              newPassword,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to update password."
        );
        return;
      }

      alert(
        "Password updated successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageHeader
      label="ACCOUNT"
      title="Update Password"
      subtitle="Change your account password."
    >
      <div className="password-card">
        <form
          className="modal-form"
          onSubmit={submit}
        >
          <label>
            Current Password
          </label>

          <input
            type="password"
            value={currentPassword}
            onChange={(event) =>
              setCurrentPassword(
                event.target.value
              )
            }
            required
          />

          <label>
            New Password
          </label>

          <input
            type="password"
            value={newPassword}
            onChange={(event) =>
              setNewPassword(
                event.target.value
              )
            }
            minLength={8}
            maxLength={16}
            required
          />

          <label>
            Confirm New Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
            }
            required
          />

          <button
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>
        </form>
      </div>
    </PageHeader>
  );
}

function OwnerDashboard({
  dashboard,
}) {
  const assignedStores =
    Array.isArray(
      dashboard?.stores
    )
      ? dashboard.stores
      : [];

  const store =
    assignedStores[0] ||
    dashboard?.store ||
    {};

  const ratings =
    Array.isArray(
      dashboard?.ratings
    )
      ? dashboard.ratings
      : Array.isArray(
          dashboard?.users
        )
      ? dashboard.users
      : [];

  const average =
    Number(
      store.average_rating ??
        store.rating ??
        dashboard?.average_rating ??
        dashboard?.averageRating ??
        0
    );

  return (
    <PageHeader
      label="STORE OWNER"
      title="Store Dashboard"
      subtitle="Monitor your store's customer ratings and performance."
    >
      <div className="owner-summary">
        <div className="owner-store-card">
          <div className="owner-store-icon">
            {initials(
              store.name || "Store"
            ).slice(0, 1)}
          </div>

          <div>
            <div className="section-label">
              YOUR STORE
            </div>

            <h2>
              {store.name ||
                "Assigned Store"}
            </h2>

            <p>
              📍{" "}
              {store.address ||
                "Address not available"}
            </p>
          </div>
        </div>

        <div className="owner-rating-card">
          <div className="owner-rating-icon">
            ⭐
          </div>

          <div>
            <span>
              Average Rating
            </span>

            <strong>
              {average.toFixed(1)}
            </strong>

            <Stars
              value={average}
              size="17px"
            />
          </div>
        </div>
      </div>

      <div className="dashboard-panel owner-ratings-panel">
        <div className="panel-header">
          <div>
            <h2>
              Customer Ratings
            </h2>

            <p>
              Users who have submitted
              ratings for your store.
            </p>
          </div>

          <span className="count-pill">
            {ratings.length} ratings
          </span>
        </div>

        {ratings.length > 0 ? (
          <div className="owner-rating-list">
            {ratings.map(
              (rating, index) => {
                const userName =
                  rating.user_name ||
                  rating.name ||
                  rating.user ||
                  "User";

                const userEmail =
                  rating.user_email ||
                  rating.email ||
                  "";

                const ratingValue =
                  Number(
                    rating.rating ||
                      rating.value ||
                      0
                  );

                return (
                  <div
                    className="owner-rating-row"
                    key={
                      rating.id ||
                      index
                    }
                  >
                    <div className="owner-user">
                      <div className="mini-avatar">
                        {initials(
                          userName
                        ).slice(
                          0,
                          1
                        )}
                      </div>

                      <div>
                        <strong>
                          {userName}
                        </strong>

                        <span>
                          {userEmail}
                        </span>
                      </div>
                    </div>

                    <div className="owner-rating-value">
                      <Stars
                        value={
                          ratingValue
                        }
                        size="18px"
                      />

                      <strong>
                        {ratingValue}/5
                      </strong>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="empty-state">
            No users have rated your
            store yet.
          </div>
        )}
      </div>
    </PageHeader>
  );
}

function AddUserModal({
  onClose,
  onSuccess,
}) {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState("user");

  const [loading, setLoading] =
    useState(false);

  const submit = async (event) => {
    event.preventDefault();

    if (
      name.length < 20 ||
      name.length > 60
    ) {
      alert(
        "Name must be between 20 and 60 characters."
      );
      return;
    }

    if (address.length > 400) {
      alert(
        "Address cannot exceed 400 characters."
      );
      return;
    }

    if (
      password.length < 8 ||
      password.length > 16
    ) {
      alert(
        "Password must be between 8 and 16 characters."
      );
      return;
    }

    if (!/[A-Z]/.test(password)) {
      alert(
        "Password must contain at least one uppercase letter."
      );
      return;
    }

    if (
      !/[!@#$%^&*(),.?":{}|<>[\]\\\/;'`~+=_-]/.test(
        password
      )
    ) {
      alert(
        "Password must contain a special character."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/admin/users`,
          {
            method: "POST",
            headers:
              authHeaders(),
            body: JSON.stringify({
              name,
              email,
              address,
              password,
              role,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to create user."
        );
        return;
      }

      alert(
        "User created successfully."
      );

      onSuccess();
    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New User"
      onClose={onClose}
    >
      <form
        className="modal-form"
        onSubmit={submit}
      >
        <label>Name</label>

        <input
          value={name}
          minLength={20}
          maxLength={60}
          onChange={(event) =>
            setName(
              event.target.value
            )
          }
          placeholder="Full name"
          required
        />

        <label>Email</label>

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          placeholder="Email address"
          required
        />

        <label>Address</label>

        <textarea
          value={address}
          maxLength={400}
          onChange={(event) =>
            setAddress(
              event.target.value
            )
          }
          placeholder="Address"
          required
        />

        <label>Password</label>

        <input
          type="password"
          value={password}
          minLength={8}
          maxLength={16}
          onChange={(event) =>
            setPassword(
              event.target.value
            )
          }
          placeholder="Password"
          required
        />

        <label>Role</label>

        <select
          value={role}
          onChange={(event) =>
            setRole(
              event.target.value
            )
          }
        >
          <option value="user">
            Normal User
          </option>

          <option value="admin">
            Administrator
          </option>

          <option value="store_owner">
            Store Owner
          </option>
        </select>

        <button
          className="primary-button"
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "Create User"}
        </button>
      </form>
    </Modal>
  );
}
function AddStoreModal({
  owners,
  onClose,
  onSuccess,
}) {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [ownerId, setOwnerId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const submit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      alert(
        "Store name is required."
      );
      return;
    }

    if (address.length > 400) {
      alert(
        "Address cannot exceed 400 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          `${API_URL}/admin/stores`,
          {
            method: "POST",
            headers:
              authHeaders(),
            body: JSON.stringify({
              name,
              email,
              address,
              owner_id:
                ownerId || null,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to create store."
        );
        return;
      }

      alert(
        "Store created successfully."
      );

      onSuccess();
    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New Store"
      onClose={onClose}
    >
      <form
        className="modal-form"
        onSubmit={submit}
      >
        <label>Store Name</label>

        <input
          value={name}
          onChange={(event) =>
            setName(
              event.target.value
            )
          }
          placeholder="Store name"
          required
        />

        <label>Email</label>

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(
              event.target.value
            )
          }
          placeholder="Store email"
          required
        />

        <label>Address</label>

        <textarea
          value={address}
          maxLength={400}
          onChange={(event) =>
            setAddress(
              event.target.value
            )
          }
          placeholder="Store address"
          required
        />

        <label>Store Owner</label>

        <select
          value={ownerId}
          onChange={(event) =>
            setOwnerId(
              event.target.value
            )
          }
        >
          <option value="">
            Not assigned
          </option>

          {owners.map((owner) => (
            <option
              key={owner.id}
              value={owner.id}
            >
              {owner.name} (
              {owner.email})
            </option>
          ))}
        </select>

        <button
          className="primary-button"
          disabled={loading}
        >
          {loading
            ? "Creating..."
            : "Create Store"}
        </button>
      </form>
    </Modal>
  );
}

function Modal({
  title,
  onClose,
  children,
}) {
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-card"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <h2>{title}</h2>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function UserDetailsModal({
  user,
  onClose,
}) {
  if (!user) return null;

  return (
    <Modal
      title="User Details"
      onClose={onClose}
    >
      <div className="user-details-content">
        <div className="details-avatar">
          {initials(user.name)}
        </div>

        <h2>{user.name}</h2>

        <div className="detail-row">
          <span>Email</span>

          <strong>
            {user.email}
          </strong>
        </div>

        <div className="detail-row">
          <span>Address</span>

          <strong>
            {user.address ||
              "Not provided"}
          </strong>
        </div>

        <div className="detail-row">
          <span>Role</span>

          <strong>
            {roleLabel(
              user.role
            )}
          </strong>
        </div>

        {user.role ===
          "store_owner" && (
          <div className="detail-row">
            <span>
              Store Rating
            </span>

            <strong>
              {user.owner_rating !=
              null
                ? `⭐ ${Number(
                    user.owner_rating
                  ).toFixed(1)}`
                : "No rating yet"}
            </strong>
          </div>
        )}
      </div>
    </Modal>
  );
}

function AdminStoresPage({
  stores,
  owners,
  onRefresh,
}) {
  const [
    nameFilter,
    setNameFilter,
  ] = useState("");

  const [
    emailFilter,
    setEmailFilter,
  ] = useState("");

  const [
    addressFilter,
    setAddressFilter,
  ] = useState("");

  const [
    sortField,
    setSortField,
  ] = useState("name");

  const [
    sortDirection,
    setSortDirection,
  ] = useState("asc");

  const [showAdd, setShowAdd] =
    useState(false);

  const filteredStores =
    useMemo(() => {
      let result = stores.filter(
        (store) => {
          return (
            String(
              store.name || ""
            )
              .toLowerCase()
              .includes(
                nameFilter.toLowerCase()
              ) &&
            String(
              store.email || ""
            )
              .toLowerCase()
              .includes(
                emailFilter.toLowerCase()
              ) &&
            String(
              store.address || ""
            )
              .toLowerCase()
              .includes(
                addressFilter.toLowerCase()
              )
          );
        }
      );

      result.sort((a, b) => {
        let first;
        let second;

        if (
          sortField === "rating"
        ) {
          first = Number(
            a.average_rating ??
              a.rating ??
              0
          );

          second = Number(
            b.average_rating ??
              b.rating ??
              0
          );
        } else {
          first = String(
            a[sortField] || ""
          ).toLowerCase();

          second = String(
            b[sortField] || ""
          ).toLowerCase();
        }

        if (first < second) {
          return sortDirection ===
            "asc"
            ? -1
            : 1;
        }

        if (first > second) {
          return sortDirection ===
            "asc"
            ? 1
            : -1;
        }

        return 0;
      });

      return result;
    }, [
      stores,
      nameFilter,
      emailFilter,
      addressFilter,
      sortField,
      sortDirection,
    ]);

  const handleSort = (
    field
  ) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <>
      <PageHeader
        label="SYSTEM ADMINISTRATOR"
        title="Store Management"
        subtitle="View registered stores, ratings and assigned owners."
      >
        <div className="page-actions">
          <button
            className="secondary-button"
            onClick={onRefresh}
          >
            ↻ Refresh
          </button>

          <button
            className="primary-button"
            onClick={() =>
              setShowAdd(true)
            }
          >
            + Add Store
          </button>
        </div>
      </PageHeader>

      <div className="filter-panel">
        <div className="filter-title">
          🔎 Filters
        </div>

        <div className="filter-grid">
          <input
            placeholder="Filter by store name"
            value={nameFilter}
            onChange={(event) =>
              setNameFilter(
                event.target.value
              )
            }
          />

          <input
            placeholder="Filter by email"
            value={emailFilter}
            onChange={(event) =>
              setEmailFilter(
                event.target.value
              )
            }
          />

          <input
            placeholder="Filter by address"
            value={addressFilter}
            onChange={(event) =>
              setAddressFilter(
                event.target.value
              )
            }
          />
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>
                  <button
                    className="sort-button"
                    onClick={() =>
                      handleSort(
                        "name"
                      )
                    }
                  >
                    Store Name{" "}
                    {sortField ===
                      "name" &&
                      (sortDirection ===
                      "asc"
                        ? "↑"
                        : "↓")}
                  </button>
                </th>

                <th>Email</th>

                <th>Address</th>

                <th>
                  <button
                    className="sort-button"
                    onClick={() =>
                      handleSort(
                        "rating"
                      )
                    }
                  >
                    Rating{" "}
                    {sortField ===
                      "rating" &&
                      (sortDirection ===
                      "asc"
                        ? "↑"
                        : "↓")}
                  </button>
                </th>

                <th>Owner</th>
              </tr>
            </thead>

            <tbody>
              {filteredStores.map(
                (store) => {
                  const rating =
                    Number(
                      store.average_rating ??
                        store.rating ??
                        0
                    );

                  const totalRatings =
                    Number(
                      store.total_ratings ??
                        store.rating_count ??
                        0
                    );

                  return (
                    <tr
                      key={
                        store.id
                      }
                    >
                      <td>
                        <div className="table-user">
                          <div className="store-letter">
                            {initials(
                              store.name
                            ).slice(
                              0,
                              1
                            )}
                          </div>

                          <strong>
                            {
                              store.name
                            }
                          </strong>
                        </div>
                      </td>

                      <td>
                        {store.email ||
                          "—"}
                      </td>

                      <td>
                        {store.address ||
                          "—"}
                      </td>

                      <td>
                        <div className="rating-line">
                          <Stars
                            value={
                              rating
                            }
                            size="15px"
                          />

                          <strong>
                            {rating.toFixed(
                              1
                            )}
                          </strong>

                          <span>
                            (
                            {
                              totalRatings
                            }
                            )
                          </span>
                        </div>
                      </td>

                      <td>
                        {store.owner_name ||
                          "Not assigned"}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {filteredStores.length ===
          0 && (
          <div className="empty-state">
            No stores match the selected
            filters.
          </div>
        )}
      </div>

      {showAdd && (
        <AddStoreModal
          owners={owners}
          onClose={() =>
            setShowAdd(false)
          }
          onSuccess={() => {
            setShowAdd(false);
            onRefresh();
          }}
        />
      )}
    </>
  );
}

function App() {
  const [page, setPage] =
    useState(
      getUser()
        ? "dashboard"
        : "home"
    );

  const [user, setUser] =
    useState(getUser());

  const [stores, setStores] =
    useState([]);

  const [users, setUsers] =
    useState([]);

  const [ratings, setRatings] =
    useState([]);

  const [owners, setOwners] =
    useState([]);

  const [stats, setStats] =
    useState({
      users: 0,
      stores: 0,
      ratings: 0,
    });

  const [
    ownerDashboard,
    setOwnerDashboard,
  ] = useState(null);

  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);

  const [
    showAddUser,
    setShowAddUser,
  ] = useState(false);

  const loadStores =
    useCallback(async () => {
      try {
        const endpoint =
          user?.role === "admin"
            ? `${API_URL}/admin/stores`
            : `${API_URL}/stores`;

        const response =
          await fetch(endpoint, {
            headers:
              getToken()
                ? {
                    Authorization: `Bearer ${getToken()}`,
                  }
                : {},
          });

        if (!response.ok)
          return;

        const data =
          await response.json();

        setStores(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Store loading error:",
          error
        );
      }
    }, [user]);

  const loadUsers =
    useCallback(async () => {
      if (
        !user ||
        user.role !== "admin"
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/admin/users`,
            {
              headers:
                authHeaders(),
            }
          );

        if (!response.ok)
          return;

        const data =
          await response.json();

        setUsers(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "User loading error:",
          error
        );
      }
    }, [user]);

  const loadRatings =
    useCallback(async () => {
      if (
        !user ||
        user.role !== "admin"
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/admin/ratings`,
            {
              headers:
                authHeaders(),
            }
          );

        if (!response.ok)
          return;

        const data =
          await response.json();

        setRatings(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Rating loading error:",
          error
        );
      }
    }, [user]);

  const loadStats =
    useCallback(async () => {
      if (
        !user ||
        user.role !== "admin"
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/admin/stats`,
            {
              headers:
                authHeaders(),
            }
          );

        if (!response.ok)
          return;

        const data =
          await response.json();

        setStats({
          users:
            data.users ??
            data.total_users ??
            data.totalUsers ??
            0,

          stores:
            data.stores ??
            data.total_stores ??
            data.totalStores ??
            0,

          ratings:
            data.ratings ??
            data.total_ratings ??
            data.totalRatings ??
            0,
        });
      } catch (error) {
        console.error(
          "Stats loading error:",
          error
        );
      }
    }, [user]);

  const loadOwners =
    useCallback(async () => {
      if (
        !user ||
        user.role !== "admin"
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/admin/users`,
            {
              headers:
                authHeaders(),
            }
          );

        if (!response.ok)
          return;

        const data =
          await response.json();

        setOwners(
          Array.isArray(data)
            ? data.filter(
                (item) =>
                  item.role ===
                  "store_owner"
              )
            : []
        );
      } catch (error) {
        console.error(
          "Owner loading error:",
          error
        );
      }
    }, [user]);

  const loadOwnerDashboard =
    useCallback(async () => {
      if (
        !user ||
        user.role !==
          "store_owner"
      ) {
        return;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/owner/dashboard`,
            {
              headers:
                authHeaders(),
            }
          );

        if (!response.ok) {
          console.error(
            "Owner dashboard request failed."
          );

          return;
        }

        const data =
          await response.json();

        setOwnerDashboard(
          data
        );
      } catch (error) {
        console.error(
          "Owner dashboard error:",
          error
        );
      }
    }, [user]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  useEffect(() => {
    if (
      user?.role === "admin"
    ) {
      loadUsers();
      loadRatings();
      loadStats();
      loadOwners();
    }
  }, [
    user,
    loadUsers,
    loadRatings,
    loadStats,
    loadOwners,
  ]);

  useEffect(() => {
    if (
      user?.role ===
      "store_owner"
    ) {
      loadOwnerDashboard();
    }
  }, [
    user,
    loadOwnerDashboard,
  ]);

  const logout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    setUser(null);
    setPage("home");
    setOwnerDashboard(null);
    setShowAddUser(false);
  };

  const handleLogin = (
    loggedInUser
  ) => {
    setUser(loggedInUser);

    if (
      loggedInUser.role ===
      "admin"
    ) {
      setPage("dashboard");
    } else if (
      loggedInUser.role ===
      "store_owner"
    ) {
      setPage(
        "owner-dashboard"
      );
    } else {
      setPage("stores");
    }
  };

  const refreshAdmin = () => {
    loadUsers();
    loadRatings();
    loadStats();
    loadOwners();
    loadStores();
  };

  const viewUser = async (id) => {
    try {
      const response =
        await fetch(
          `${API_URL}/admin/users/${id}`,
          {
            headers:
              authHeaders(),
          }
        );

      if (!response.ok) {
        alert(
          "Unable to load user details."
        );

        return;
      }

      const data =
        await response.json();

      setSelectedUser(data);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to load user details."
      );
    }
  };

  if (
    !user &&
    page === "home"
  ) {
    return (
      <HomePage
        stores={stores}
        onLogin={() =>
          setPage("login")
        }
        onRegister={() =>
          setPage("register")
        }
      />
    );
  }

  if (
    !user &&
    page === "login"
  ) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onRegister={() =>
          setPage("register")
        }
        onBack={() =>
          setPage("home")
        }
      />
    );
  }

  if (
    !user &&
    page === "register"
  ) {
    return (
      <RegisterPage
        onRegistered={() =>
          setPage("login")
        }
        onLogin={() =>
          setPage("login")
        }
        onBack={() =>
          setPage("home")
        }
      />
    );
  }

  if (!user) {
    return null;
  }

  if (
    user.role === "admin"
  ) {
    return (
      <>
        <Layout
          user={user}
          activePage={page}
          setActivePage={setPage}
          onLogout={logout}
        >
          {page ===
            "dashboard" && (
            <AdminDashboard
              stats={stats}
              users={users}
              stores={stores}
              ratings={ratings}
              setActivePage={
                setPage
              }
            />
          )}

          {page === "users" && (
            <AdminUsersPage
              users={users}
              onRefresh={
                refreshAdmin
              }
              onViewUser={
                viewUser
              }
              onAddUser={() =>
                setShowAddUser(
                  true
                )
              }
            />
          )}

          {page === "stores" && (
            <AdminStoresPage
              stores={stores}
              owners={owners}
              onRefresh={
                refreshAdmin
              }
            />
          )}

          {page === "ratings" && (
            <AdminRatingsPage
              ratings={ratings}
            />
          )}

          {page === "password" && (
            <PasswordPage
              user={user}
            />
          )}
        </Layout>

        {selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() =>
              setSelectedUser(
                null
              )
            }
          />
        )}

        {showAddUser && (
          <AddUserModal
            onClose={() =>
              setShowAddUser(
                false
              )
            }
            onSuccess={() => {
              setShowAddUser(
                false
              );

              refreshAdmin();
            }}
          />
        )}
      </>
    );
  }

  if (
    user.role ===
    "store_owner"
  ) {
    return (
      <Layout
        user={user}
        activePage={page}
        setActivePage={setPage}
        onLogout={logout}
      >
        {page ===
          "owner-dashboard" && (
          <OwnerDashboard
            dashboard={
              ownerDashboard
            }
          />
        )}

        {page === "password" && (
          <PasswordPage
            user={user}
          />
        )}
      </Layout>
    );
  }

  return (
    <Layout
      user={user}
      activePage={page}
      setActivePage={setPage}
      onLogout={logout}
    >
      {page === "stores" && (
        <UserStoresPage
          stores={stores}
          onRefresh={loadStores}
        />
      )}

      {page === "password" && (
        <PasswordPage
          user={user}
        />
      )}
    </Layout>
  );
}

export default App;