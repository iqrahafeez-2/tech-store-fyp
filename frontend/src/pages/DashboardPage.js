import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import ProductCard from '../components/ProductCard';
import { productApi } from '../services/api';
import { useStore } from '../context/StoreContext';

const dashboardTabs = [
  {
    id: 'orders',
    label: 'My Orders',
    icon: '📦',
  },
  {
    id: 'wishlist',
    label: 'Wishlist',
    icon: '♡',
  },
  {
    id: 'addresses',
    label: 'Saved Addresses',
    icon: '📍',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: '🔔',
  },
  {
    id: 'ai',
    label: 'AI Picks',
    icon: '🤖',
  },
  {
    id: 'settings',
    label: 'Account Settings',
    icon: '⚙️',
  },
];

const demoOrders = [
  {
    id: 'TS-0042',
    product: 'ASUS ROG Strix',
    status: 'In Transit',
    total: '$999',
    date: '14 May 2026',
  },
  {
    id: 'TS-0041',
    product: 'AirPods Pro',
    status: 'Delivered',
    total: '$249',
    date: '12 May 2026',
  },
  {
    id: 'TS-0040',
    product: 'WD Black SSD',
    status: 'Processing',
    total: '$129',
    date: '10 May 2026',
  },
];

const demoAddresses = [
  {
    id: 1,
    label: 'Home',
    name: 'Iqra Hafeez',
    phone: '+92 300 0000000',
    city: 'Islamabad',
    address: 'Park View City, Islamabad',
    default: true,
  },
  {
    id: 2,
    label: 'University',
    name: 'Iqra Hafeez',
    phone: '+92 300 0000000',
    city: 'Islamabad',
    address: 'Bahria University Islamabad Campus',
    default: false,
  },
];

const demoNotifications = [
  {
    id: 1,
    type: 'Order',
    message: 'Your order TS-0042 is currently in transit.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 2,
    type: 'Offer',
    message: 'Laptop flash deals are live. Check AI picks for smart recommendations.',
    time: 'Today',
    unread: true,
  },
  {
    id: 3,
    type: 'AI Alert',
    message: 'TechBot found products that match your recent searches.',
    time: 'Yesterday',
    unread: false,
  },
];

function getInitials(name = 'User') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

function getTabFromPath(pathname, search, initialTab) {
  const params = new URLSearchParams(search);
  const tabFromQuery = params.get('tab');

  if (tabFromQuery && dashboardTabs.some((tab) => tab.id === tabFromQuery)) {
    return tabFromQuery;
  }

  if (pathname === '/wishlist') return 'wishlist';
  if (pathname === '/orders') return 'orders';
  if (pathname === '/addresses') return 'addresses';
  if (pathname === '/notifications') return 'notifications';
  if (pathname === '/profile') return 'settings';

  if (initialTab && dashboardTabs.some((tab) => tab.id === initialTab)) {
    return initialTab;
  }

  return 'orders';
}

function DashboardPage({ initialTab = 'orders' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user,
    cartCount,
    wishlist,
    wishlistCount,
    moveWishlistToCart,
    toggleWishlist,
    openAuth,
    logout,
    updateUser,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState(() =>
    getTabFromPath(location.pathname, location.search, initialTab)
  );

  const [aiProducts, setAiProducts] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [addresses, setAddresses] = useState(demoAddresses);
  const [notifications, setNotifications] = useState(demoNotifications);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Iqra Hafeez',
    email: user?.email || 'iqra.hafeez@email.com',
    phone: user?.phone || '+92 300 0000000',
  });

  useEffect(() => {
    const nextTab = getTabFromPath(location.pathname, location.search, initialTab);
    setActiveTab(nextTab);
  }, [location.pathname, location.search, initialTab]);

  const displayUser = useMemo(() => {
    if (user) {
      return {
        name: user.name || 'Iqra Hafeez',
        email: user.email || 'iqra.hafeez@email.com',
        phone: user.phone || '',
      };
    }

    return {
      name: 'Guest User',
      email: 'Please login to personalize dashboard',
      phone: '',
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || 'Iqra Hafeez',
        email: user.email || 'iqra.hafeez@email.com',
        phone: user.phone || '+92 300 0000000',
      });
    }
  }, [user]);

  useEffect(() => {
    let ignore = false;

    async function loadAiPicks() {
      try {
        setAiLoading(true);

        const response = await productApi.getRecommendations({
          query: 'laptop',
          usage: 'study',
          budget: 1200,
          preferredBrand: '',
        });

        if (!ignore) {
          setAiProducts((response.products || []).slice(0, 4));
        }
      } catch {
        if (!ignore) {
          setAiProducts([]);
        }
      } finally {
        if (!ignore) {
          setAiLoading(false);
        }
      }
    }

    if (activeTab === 'ai' || aiProducts.length === 0) {
      loadAiPicks();
    }

    return () => {
      ignore = true;
    };
  }, [activeTab, aiProducts.length]);

  const unreadCount = notifications.filter((item) => item.unread).length;

  const updateRouteForTab = (tabId) => {
    if (tabId === 'wishlist') {
      navigate('/wishlist');
      return;
    }

    if (tabId === 'orders') {
      navigate('/orders');
      return;
    }

    if (tabId === 'addresses') {
      navigate('/addresses');
      return;
    }

    if (tabId === 'notifications') {
      navigate('/notifications');
      return;
    }

    if (tabId === 'settings') {
      navigate('/profile');
      return;
    }

    navigate(`/dashboard?tab=${tabId}`);
  };

  const handleProtectedTab = (tabId) => {
    if (!user && ['settings', 'addresses', 'orders', 'notifications'].includes(tabId)) {
      openAuth('login');
      showToast('Please login to access this dashboard section', 'info');
      return;
    }

    setActiveTab(tabId);
    updateRouteForTab(tabId);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveProfile = (event) => {
    event.preventDefault();

    if (!profileForm.name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    if (!profileForm.email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    updateUser({
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim(),
    });
  };

  const handleAddAddress = () => {
    const nextAddress = {
      id: Date.now(),
      label: `Address ${addresses.length + 1}`,
      name: displayUser.name,
      phone: displayUser.phone || '+92 300 0000000',
      city: 'Islamabad',
      address: 'New saved address placeholder',
      default: false,
    };

    setAddresses((items) => [...items, nextAddress]);
    showToast('New address added. You can edit it later.', 'success');
  };

  const handleDeleteAddress = (addressId) => {
    setAddresses((items) => items.filter((item) => item.id !== addressId));
    showToast('Address deleted successfully', 'info');
  };

  const handleDefaultAddress = (addressId) => {
    setAddresses((items) =>
      items.map((item) => ({
        ...item,
        default: item.id === addressId,
      }))
    );

    showToast('Default address updated', 'success');
  };

  const markAllNotifications = () => {
    setNotifications((items) =>
      items.map((item) => ({
        ...item,
        unread: false,
      }))
    );

    showToast('All notifications marked as read', 'success');
  };

  const renderOrders = () => (
    <section className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div>
          <h2>My Orders</h2>
          <p>Track orders, view status and reorder products quickly.</p>
        </div>

        <Link to="/track-order" className="dashboard-action-btn">
          Track Order
        </Link>
      </div>

      <div className="dashboard-order-list">
        {demoOrders.map((order) => (
          <article key={order.id} className="dashboard-order-card">
            <div>
              <span>{order.id}</span>
              <strong>{order.product}</strong>
              <small>{order.date}</small>
            </div>

            <div>
              <b className={`status-badge status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {order.status}
              </b>
              <strong>{order.total}</strong>
            </div>

            <button
              type="button"
              onClick={() => {
                showToast(`Order ${order.id} details opened`, 'info');
              }}
            >
              View Details
            </button>
          </article>
        ))}
      </div>
    </section>
  );

  const renderWishlist = () => (
    <section className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div>
          <h2>Wishlist</h2>
          <p>Save products and move them to cart when ready.</p>
        </div>

        <Link to="/products" className="dashboard-action-btn">
          Browse Products
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="dashboard-empty">
          <span>♡</span>
          <h3>Your wishlist is empty</h3>
          <p>Add products to wishlist from product cards or product details page.</p>
          <Link to="/products" className="dashboard-primary-btn">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="dashboard-wishlist-grid">
          {wishlist.map((product) => (
            <article className="dashboard-wishlist-card" key={product.id || product.productId}>
              <img
                src={product.image || product.thumbnail || product.images?.[0]}
                alt={product.title}
                onError={(event) => {
                  event.currentTarget.src =
                    'https://dummyjson.com/image/300x200/0f172a/ffffff?text=Tech+Store';
                }}
              />

              <div>
                <strong>{product.title}</strong>
                <span>${Number(product.price || 0).toLocaleString('en-US')} · In stock</span>
              </div>

              <div className="wishlist-actions">
                <button type="button" onClick={() => moveWishlistToCart(product)}>
                  Move to Cart
                </button>
                <button type="button" onClick={() => toggleWishlist(product)}>
                  Remove
                </button>
                <Link to={`/products/${encodeURIComponent(product.id || product.productId)}`}>
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );

  const renderAddresses = () => (
    <section className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div>
          <h2>Saved Addresses</h2>
          <p>Manage delivery addresses for faster checkout.</p>
        </div>

        <button type="button" className="dashboard-action-btn" onClick={handleAddAddress}>
          Add Address
        </button>
      </div>

      <div className="dashboard-address-grid">
        {addresses.map((address) => (
          <article key={address.id} className="dashboard-address-card">
            <div className="address-title-row">
              <strong>{address.label}</strong>
              {address.default && <span>Default</span>}
            </div>

            <p>{address.name}</p>
            <p>{address.phone}</p>
            <p>{address.address}, {address.city}</p>

            <div>
              <button type="button" onClick={() => handleDefaultAddress(address.id)}>
                Set Default
              </button>
              <button type="button" onClick={() => showToast('Edit address action is ready for implementation', 'info')}>
                Edit
              </button>
              <button type="button" onClick={() => handleDeleteAddress(address.id)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  const renderNotifications = () => (
    <section className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div>
          <h2>Notifications</h2>
          <p>View order updates, AI alerts and offer notifications.</p>
        </div>

        <button type="button" className="dashboard-action-btn" onClick={markAllNotifications}>
          Mark All Read
        </button>
      </div>

      <div className="dashboard-notification-tabs">
        <button type="button">All</button>
        <button type="button">Orders</button>
        <button type="button">Offers</button>
        <button type="button">AI Alerts</button>
      </div>

      <div className="dashboard-notification-list">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={notification.unread ? 'dashboard-notification unread' : 'dashboard-notification'}
          >
            <span>{notification.type}</span>
            <div>
              <strong>{notification.message}</strong>
              <small>{notification.time}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  const renderAiPicks = () => (
    <section className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div>
          <h2>AI Personalized Recommendations</h2>
          <p>Smart picks based on budget, product rating, trend and user intent.</p>
        </div>

        <Link to="/ai-recommendations" className="dashboard-action-btn">
          Open AI Page
        </Link>
      </div>

      <div className="dashboard-ai-chips">
        <button type="button">Study</button>
        <button type="button">Gaming</button>
        <button type="button">Office</button>
        <button type="button">Budget</button>
        <button type="button">Premium</button>
      </div>

      {aiLoading ? (
        <div className="dashboard-ai-loading">
          <div />
          <div />
          <div />
          <div />
        </div>
      ) : aiProducts.length > 0 ? (
        <div className="dashboard-ai-grid">
          {aiProducts.map((product) => (
            <ProductCard key={product.id || product.productId} product={product} compact />
          ))}
        </div>
      ) : (
        <div className="dashboard-empty">
          <span>🤖</span>
          <h3>No AI picks loaded</h3>
          <p>Open the AI recommendations page to generate smart product picks.</p>
        </div>
      )}
    </section>
  );

  const renderSettings = () => (
    <section className="dashboard-panel">
      <div className="dashboard-panel-header">
        <div>
          <h2>Account Settings</h2>
          <p>Update your profile information and preferences.</p>
        </div>
      </div>

      <form className="dashboard-settings-form" onSubmit={handleSaveProfile}>
        <label>
          <span>Full Name</span>
          <input
            value={profileForm.name}
            onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
          />
        </label>

        <label>
          <span>Email Address</span>
          <input
            type="email"
            value={profileForm.email}
            onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>

        <label>
          <span>Phone Number</span>
          <input
            value={profileForm.phone}
            onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
          />
        </label>

        <label>
          <span>Shopping Preference</span>
          <select defaultValue="study">
            <option value="study">Study and productivity</option>
            <option value="gaming">Gaming</option>
            <option value="office">Office work</option>
            <option value="creator">Creator products</option>
          </select>
        </label>

        <div className="settings-actions">
          <button type="submit">Save Changes</button>
          <button
            type="button"
            onClick={() =>
              setProfileForm({
                name: displayUser.name,
                email: displayUser.email,
                phone: displayUser.phone || '',
              })
            }
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );

  const renderActiveContent = () => {
    if (activeTab === 'orders') return renderOrders();
    if (activeTab === 'wishlist') return renderWishlist();
    if (activeTab === 'addresses') return renderAddresses();
    if (activeTab === 'notifications') return renderNotifications();
    if (activeTab === 'ai') return renderAiPicks();
    if (activeTab === 'settings') return renderSettings();
    return renderOrders();
  };

  return (
    <main className="dashboard-page">
      <div className="container dashboard-layout-pro">
        <aside className="dashboard-user-card">
          <div className="dashboard-user-avatar">
            {getInitials(displayUser.name)}
          </div>

          <h2>{displayUser.name}</h2>
          <p>{displayUser.email}</p>

          {!user && (
            <button type="button" className="dashboard-primary-btn" onClick={() => openAuth('login')}>
              Login to Personalize
            </button>
          )}

          <nav className="dashboard-side-nav">
            {dashboardTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => handleProtectedTab(tab.id)}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.id === 'wishlist' && wishlistCount > 0 && <b>{wishlistCount}</b>}
                {tab.id === 'notifications' && unreadCount > 0 && <b>{unreadCount}</b>}
              </button>
            ))}

            <button type="button" className="logout-btn" onClick={handleLogout}>
              <span>🚪</span>
              Logout
            </button>
          </nav>
        </aside>

        <section className="dashboard-main-pro">
          <div className="dashboard-title-area">
            <span className="eyebrow">User Dashboard</span>
            <h1>Account overview</h1>
            <p>
              Welcome {displayUser.name}. Manage your orders, wishlist, saved addresses,
              notifications, AI recommendations and account settings from one clean dashboard.
            </p>
          </div>

          <div className="dashboard-stat-grid">
            <div className="dashboard-stat-card">
              <span>Total Orders</span>
              <strong>{demoOrders.length + 11}</strong>
            </div>

            <div className="dashboard-stat-card">
              <span>Wishlist Items</span>
              <strong>{wishlistCount}</strong>
            </div>

            <div className="dashboard-stat-card">
              <span>Cart Items</span>
              <strong>{cartCount}</strong>
            </div>

            <div className="dashboard-stat-card">
              <span>Saved Addresses</span>
              <strong>{addresses.length}</strong>
            </div>
          </div>

          {renderActiveContent()}
        </section>
      </div>

      <style>{`
        .dashboard-page {
          min-height: 100vh;
          padding: 22px 0 70px;
        }

        .dashboard-layout-pro {
          display: grid;
          grid-template-columns: 300px minmax(0, 1fr);
          gap: 28px;
          align-items: start;
        }

        .dashboard-user-card {
          position: sticky;
          top: calc(var(--navbar-height) + 22px);
          display: grid;
          gap: 14px;
          border: 1px solid var(--border);
          border-radius: 30px;
          background: var(--panel);
          box-shadow: var(--shadow);
          backdrop-filter: blur(18px);
          padding: 24px;
          text-align: center;
        }

        .dashboard-user-avatar {
          display: grid;
          place-items: center;
          width: 86px;
          height: 86px;
          margin: 0 auto 4px;
          border-radius: 28px;
          background: linear-gradient(135deg, var(--brand), var(--accent-2));
          color: #ffffff;
          font-size: 1.5rem;
          font-weight: 950;
          box-shadow: var(--glow);
        }

        .dashboard-user-card h2 {
          margin: 0;
          color: var(--text);
          font-size: 1.4rem;
          letter-spacing: -0.04em;
        }

        .dashboard-user-card p {
          margin: 0;
          color: var(--muted);
          overflow-wrap: anywhere;
          font-weight: 700;
        }

        .dashboard-side-nav {
          display: grid;
          gap: 10px;
          margin-top: 8px;
        }

        .dashboard-side-nav button {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          min-height: 48px;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--panel-2);
          color: var(--text-soft);
          padding: 0 14px;
          font-weight: 900;
          text-align: left;
          transition: transform 0.18s ease, border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
        }

        .dashboard-side-nav button:hover,
        .dashboard-side-nav button.active {
          transform: translateY(-2px);
          border-color: var(--brand);
          color: var(--brand);
          background: var(--primary-soft);
          box-shadow: var(--glow);
        }

        .dashboard-side-nav button b {
          margin-left: auto;
          display: grid;
          place-items: center;
          min-width: 22px;
          height: 22px;
          border-radius: 999px;
          background: var(--danger);
          color: #ffffff;
          font-size: 0.72rem;
        }

        .dashboard-side-nav .logout-btn {
          color: var(--danger);
        }

        .dashboard-main-pro {
          min-width: 0;
          display: grid;
          gap: 24px;
        }

        .dashboard-title-area {
          padding: 8px 0 2px;
        }

        .dashboard-title-area h1 {
          margin: 10px 0 10px;
          font-size: clamp(2.5rem, 5vw, 4.7rem);
          line-height: 0.95;
          letter-spacing: -0.07em;
          color: var(--text);
        }

        .dashboard-title-area p {
          margin: 0;
          max-width: 780px;
          color: var(--muted);
          line-height: 1.75;
          font-weight: 700;
        }

        .dashboard-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .dashboard-stat-card {
          border: 1px solid var(--border);
          border-radius: 24px;
          background: var(--panel);
          box-shadow: var(--shadow-sm);
          padding: 20px;
        }

        .dashboard-stat-card span {
          color: var(--muted);
          font-weight: 850;
        }

        .dashboard-stat-card strong {
          display: block;
          margin-top: 14px;
          color: var(--text);
          font-size: 2rem;
          line-height: 1;
          letter-spacing: -0.06em;
        }

        .dashboard-panel {
          border: 1px solid var(--border);
          border-radius: 30px;
          background: var(--panel);
          box-shadow: var(--shadow);
          padding: 24px;
          backdrop-filter: blur(18px);
        }

        .dashboard-panel-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }

        .dashboard-panel-header h2 {
          margin: 0;
          color: var(--text);
          font-size: 1.5rem;
          letter-spacing: -0.04em;
        }

        .dashboard-panel-header p {
          margin: 6px 0 0;
          color: var(--muted);
          line-height: 1.55;
        }

        .dashboard-action-btn,
        .dashboard-primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          border: 0;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--brand), var(--accent-2));
          color: #ffffff;
          padding: 0 16px;
          font-weight: 950;
          box-shadow: var(--glow);
        }

        .dashboard-order-list,
        .dashboard-notification-list {
          display: grid;
          gap: 12px;
        }

        .dashboard-order-card {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto auto;
          gap: 16px;
          align-items: center;
          border: 1px solid var(--border);
          border-radius: 20px;
          background: var(--panel-2);
          padding: 16px;
        }

        .dashboard-order-card span,
        .dashboard-order-card small {
          color: var(--muted);
          font-weight: 800;
        }

        .dashboard-order-card strong {
          display: block;
          color: var(--text);
          margin: 5px 0;
        }

        .dashboard-order-card button,
        .wishlist-actions button,
        .wishlist-actions a,
        .dashboard-address-card button,
        .settings-actions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 36px;
          border: 1px solid var(--border);
          border-radius: 999px;
          background: var(--panel);
          color: var(--text);
          padding: 0 12px;
          font-weight: 850;
        }

        .dashboard-order-card button:hover,
        .wishlist-actions button:hover,
        .wishlist-actions a:hover,
        .dashboard-address-card button:hover,
        .settings-actions button:hover {
          border-color: var(--brand);
          color: var(--brand);
        }

        .status-badge {
          display: inline-flex;
          border-radius: 999px;
          padding: 7px 10px;
          background: var(--primary-soft);
          color: var(--brand);
          font-size: 0.78rem;
          margin-bottom: 6px;
        }

        .status-delivered {
          background: var(--success-soft);
          color: var(--success);
        }

        .status-processing {
          background: var(--warning-soft);
          color: var(--warning);
        }

        .dashboard-empty {
          display: grid;
          place-items: center;
          gap: 12px;
          min-height: 270px;
          border: 1px dashed var(--border);
          border-radius: 24px;
          background: var(--panel-2);
          text-align: center;
          padding: 30px;
        }

        .dashboard-empty span {
          font-size: 2.6rem;
        }

        .dashboard-empty h3 {
          margin: 0;
        }

        .dashboard-empty p {
          margin: 0;
          color: var(--muted);
          max-width: 520px;
          line-height: 1.6;
        }

        .dashboard-wishlist-grid,
        .dashboard-address-grid,
        .dashboard-ai-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .dashboard-wishlist-card,
        .dashboard-address-card {
          border: 1px solid var(--border);
          border-radius: 22px;
          background: var(--panel-2);
          padding: 14px;
        }

        .dashboard-wishlist-card {
          display: grid;
          grid-template-columns: 78px minmax(0, 1fr);
          gap: 14px;
          align-items: center;
        }

        .dashboard-wishlist-card img {
          width: 78px;
          height: 78px;
          object-fit: contain;
          border-radius: 18px;
          background: var(--panel);
          padding: 8px;
        }

        .dashboard-wishlist-card strong {
          display: block;
          color: var(--text);
          margin-bottom: 6px;
        }

        .dashboard-wishlist-card span {
          color: var(--muted);
          font-weight: 800;
        }

        .wishlist-actions {
          grid-column: 1 / -1;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .address-title-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .address-title-row strong {
          color: var(--text);
        }

        .address-title-row span {
          color: var(--success);
          font-weight: 900;
          font-size: 0.8rem;
        }

        .dashboard-address-card p {
          color: var(--muted);
          margin: 6px 0;
          line-height: 1.5;
        }

        .dashboard-address-card div:last-child {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .dashboard-notification-tabs,
        .dashboard-ai-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .dashboard-notification-tabs button,
        .dashboard-ai-chips button {
          min-height: 34px;
          border: 1px solid var(--border);
          border-radius: 999px;
          background: var(--panel-2);
          color: var(--muted);
          padding: 0 12px;
          font-weight: 850;
        }

        .dashboard-notification-tabs button:hover,
        .dashboard-ai-chips button:hover {
          color: var(--brand);
          border-color: var(--brand);
        }

        .dashboard-notification {
          display: grid;
          grid-template-columns: 90px minmax(0, 1fr);
          gap: 12px;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: var(--panel-2);
          padding: 14px;
        }

        .dashboard-notification.unread {
          border-color: var(--brand);
          box-shadow: var(--glow);
        }

        .dashboard-notification > span {
          color: var(--brand);
          font-weight: 950;
        }

        .dashboard-notification strong {
          display: block;
          color: var(--text);
        }

        .dashboard-notification small {
          display: block;
          margin-top: 5px;
          color: var(--muted);
          font-weight: 800;
        }

        .dashboard-ai-loading {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .dashboard-ai-loading div {
          height: 260px;
          border-radius: 24px;
          background: linear-gradient(90deg, var(--panel-2), rgba(56, 189, 248, 0.1), var(--panel-2));
          background-size: 200% 100%;
          animation: skeletonFlow 1.2s linear infinite;
        }

        .dashboard-settings-form {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .dashboard-settings-form label {
          display: grid;
          gap: 8px;
        }

        .dashboard-settings-form label span {
          color: var(--muted);
          font-weight: 900;
          font-size: 0.85rem;
        }

        .dashboard-settings-form input,
        .dashboard-settings-form select {
          min-height: 48px;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--panel-2);
          color: var(--text);
          outline: none;
          padding: 0 14px;
          font-weight: 800;
        }

        .dashboard-settings-form input:focus,
        .dashboard-settings-form select:focus {
          border-color: var(--brand);
          box-shadow: var(--glow);
        }

        .settings-actions {
          grid-column: 1 / -1;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .settings-actions button:first-child {
          border: 0;
          background: linear-gradient(135deg, var(--brand), var(--accent-2));
          color: #fff;
        }

        @media (max-width: 1100px) {
          .dashboard-layout-pro {
            grid-template-columns: 1fr;
          }

          .dashboard-user-card {
            position: static;
          }

          .dashboard-side-nav {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .dashboard-stat-grid,
          .dashboard-ai-loading {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .dashboard-title-area h1 {
            font-size: 3rem;
          }

          .dashboard-stat-grid,
          .dashboard-wishlist-grid,
          .dashboard-address-grid,
          .dashboard-ai-grid,
          .dashboard-settings-form {
            grid-template-columns: 1fr;
          }

          .dashboard-order-card {
            grid-template-columns: 1fr;
          }

          .dashboard-side-nav {
            grid-template-columns: 1fr;
          }

          .dashboard-notification {
            grid-template-columns: 1fr;
          }

          .dashboard-panel-header {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}

export default DashboardPage;