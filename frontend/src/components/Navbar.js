import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { productApi } from '../services/api';
import { useStore } from '../context/StoreContext';
import './Navbar.css';

const navLinks = [
  {
    label: 'Home',
    path: '/',
  },
  {
    label: 'Categories',
    path: '/categories',
  },
  {
    label: 'Deals',
    path: '/deals',
  },
  {
    label: 'AI Picks',
    path: '/ai-recommendations',
  },
  {
    label: 'Products',
    path: '/products',
  },
];

const quickCategories = [
  {
    label: 'Mobiles',
    query: 'smartphone',
    icon: '📱',
  },
  {
    label: 'Laptops',
    query: 'laptop',
    icon: '💻',
  },
  {
    label: 'Accessories',
    query: 'headphones',
    icon: '🔌',
  },
  {
    label: 'Gaming',
    query: 'gaming laptop',
    icon: '🎮',
  },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  const {
    cartCount,
    wishlistCount,
    user,
    theme,
    toggleTheme,
    openAuth,
    logout,
    recentSearches,
    addRecentSearch,
  } = useStore();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || params.get('q') || '';

    if (location.pathname.includes('/products') && search) {
      setQuery(search);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSuggestions(recentSearches || []);
      return undefined;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const response = await productApi.getSuggestions(trimmed);

        if (!cancelled) {
          setSuggestions(response?.suggestions || []);
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, recentSearches]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!searchRef.current?.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (event) => {
    event?.preventDefault();

    const value = query.trim();

    if (!value) {
      navigate('/products');
      return;
    }

    addRecentSearch(value);
    navigate(`/products?search=${encodeURIComponent(value)}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (value) => {
    setQuery(value);
    addRecentSearch(value);
    navigate(`/products?search=${encodeURIComponent(value)}`);
    setShowSuggestions(false);
  };

  const handleCategoryClick = (item) => {
    addRecentSearch(item.query);
    navigate(`/products?search=${encodeURIComponent(item.query)}&category=all`);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="navbar-shell">
        <div className="navbar-top">
          <div className="container navbar-top-inner">
            <div className="navbar-trust">
              <span>⚡ AI powered shopping</span>
              <span>🚚 Fast delivery</span>
              <span>🔒 Secure checkout</span>
            </div>

            <div className="navbar-top-actions">
              <Link to="/track-order">Track Order</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/contact">Support</Link>
            </div>
          </div>
        </div>

        <nav className="navbar-main" aria-label="Main navigation">
          <div className="container navbar-inner">
            <Link to="/" className="navbar-logo" aria-label="Tech Store home">
              <span className="navbar-logo-icon">TS</span>
              <span>
                <strong>Tech Store</strong>
                <small>AI Commerce</small>
              </span>
            </Link>

            <button
              type="button"
              className="navbar-mobile-toggle"
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((value) => !value)}
            >
              <span />
              <span />
              <span />
            </button>

            <form className="navbar-search" onSubmit={handleSearch} ref={searchRef}>
              <span className="navbar-search-icon">⌕</span>

              <input
                type="search"
                value={query}
                placeholder="Search laptops, mobiles, accessories..."
                aria-label="Search products"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />

              <button type="submit" className="navbar-search-button">
                Search
              </button>

              {showSuggestions && (query.length > 1 || suggestions.length > 0) && (
                <div className="navbar-suggestions">
                  <div className="navbar-suggestions-header">
                    <span>{searchLoading ? 'Finding suggestions...' : 'Smart suggestions'}</span>
                    <small>DummyJSON dynamic search</small>
                  </div>

                  {suggestions.length > 0 ? (
                    suggestions.slice(0, 8).map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="navbar-suggestion-item"
                        onClick={() => handleSuggestionClick(item)}
                      >
                        <span>⌕</span>
                        <strong>{item}</strong>
                      </button>
                    ))
                  ) : (
                    <button
                      type="button"
                      className="navbar-suggestion-item"
                      onClick={() => handleSuggestionClick(query)}
                    >
                      <span>↵</span>
                      <strong>Search for "{query}"</strong>
                    </button>
                  )}
                </div>
              )}
            </form>

            <div className="navbar-actions">
              <button
                type="button"
                className="navbar-icon-button"
                aria-label="Toggle theme"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              <Link to="/wishlist" className="navbar-icon-button" aria-label="Wishlist">
                ♡
                {wishlistCount > 0 && <span className="navbar-count">{wishlistCount}</span>}
              </Link>

              <Link to="/cart" className="navbar-icon-button" aria-label="Cart">
                🛒
                {cartCount > 0 && <span className="navbar-count">{cartCount}</span>}
              </Link>

              {user ? (
                <div className="navbar-user-menu">
                  <Link to="/dashboard" className="navbar-user-button">
                    <span className="navbar-user-avatar">{user.name?.charAt(0) || 'U'}</span>
                    <span>{user.name?.split(' ')[0] || 'User'}</span>
                  </Link>

                  <button type="button" className="navbar-logout" onClick={logout}>
                    Logout
                  </button>
                </div>
              ) : (
                <button type="button" className="navbar-login-button" onClick={() => openAuth('login')}>
                  Login
                </button>
              )}
            </div>
          </div>

          <div className="container navbar-bottom">
            <div className="navbar-links">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="navbar-category-strip">
              {quickCategories.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleCategoryClick(item)}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className={mobileOpen ? 'mobile-panel open' : 'mobile-panel'}>
          <div className="mobile-panel-inner">
            <form className="mobile-search" onSubmit={handleSearch}>
              <input
                type="search"
                value={query}
                placeholder="Search products..."
                onChange={(event) => setQuery(event.target.value)}
              />
              <button type="submit">Search</button>
            </form>

            <div className="mobile-links">
              {navLinks.map((link) => (
                <NavLink key={link.path} to={link.path}>
                  {link.label}
                </NavLink>
              ))}

              <Link to="/wishlist">Wishlist ({wishlistCount})</Link>
              <Link to="/cart">Cart ({cartCount})</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/admin">Admin</Link>
            </div>

            <div className="mobile-categories">
              {quickCategories.map((item) => (
                <button key={item.label} type="button" onClick={() => handleCategoryClick(item)}>
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            {!user && (
              <button type="button" className="btn btn-primary mobile-auth-button" onClick={() => openAuth('login')}>
                Login or Signup
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mobile-bottom-nav" aria-label="Mobile quick navigation">
        <Link to="/">⌂<span>Home</span></Link>
        <Link to="/products">⌕<span>Search</span></Link>
        <Link to="/ai-recommendations">🤖<span>AI</span></Link>
        <Link to="/cart">🛒<span>Cart</span></Link>
        <Link to="/dashboard">👤<span>User</span></Link>
      </div>
    </>
  );
}

export default Navbar;