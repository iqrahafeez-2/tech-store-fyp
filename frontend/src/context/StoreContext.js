import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

const StoreContext = createContext(null);

const STORAGE_KEYS = {
  cart: 'tech_store_cart',
  wishlist: 'tech_store_wishlist',
  compare: 'tech_store_compare',
  user: 'tech_store_user',
  theme: 'tech_store_theme',
  recentSearches: 'tech_store_recent_searches',
  recentlyViewed: 'tech_store_recently_viewed',
};

const initialState = {
  cart: [],
  wishlist: [],
  compare: [],
  compareOpen: false,
  user: null,
  theme: 'dark',
  recentSearches: [],
  recentlyViewed: [],
  toast: null,
  authModal: {
    open: false,
    mode: 'login',
  },
};

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Ignore storage errors so UI still works. */
  }
}

function getProductKey(product) {
  return String(product?.id || product?.productId || product?.externalId || product?.title || '');
}

function deriveNameFromEmail(email) {
  const fallback = 'Tech Store User';

  if (!email || !email.includes('@')) {
    return fallback;
  }

  const localPart = email.split('@')[0];

  const cleaned = localPart
    .replace(/[0-9]/g, ' ')
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return fallback;
  }

  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function normalizeUser(payload = {}) {
  const email = payload.email || 'user@techstore.com';

  let name =
    payload.name ||
    payload.fullName ||
    payload.displayName ||
    deriveNameFromEmail(email);

  if (!name || name === 'Tech Store User') {
    name = deriveNameFromEmail(email);
  }

  return {
    id: payload.id || `user_${Date.now()}`,
    name,
    email,
    phone: payload.phone || '',
    role: payload.role || (email.toLowerCase().includes('admin') ? 'admin' : 'user'),
    avatar: payload.avatar || '',
  };
}

function normalizeProduct(product) {
  const id = getProductKey(product);
  const stock = Number(product?.stock || 25) > 0 ? Number(product.stock || 25) : 25;

  return {
    ...product,
    id,
    productId: product?.productId || id,
    title: product?.title || 'Tech Product',
    brand: product?.brand || 'Tech Brand',
    category: product?.category || 'Technology',
    rawCategory: product?.rawCategory || product?.category || 'technology',
    price: Number(product?.price || 0),
    rating: Number(product?.rating || 4.5),
    reviewCount: Number(product?.reviewCount || product?.reviews?.length || 24),
    image: product?.image || product?.thumbnail || product?.images?.[0] || '',
    images: Array.isArray(product?.images) ? product.images : [product?.image || product?.thumbnail].filter(Boolean),
    stock,
    availability: 'In stock',
    source: product?.source || 'dummyjson',
    discountPercentage: Number(product?.discountPercentage || 0),
    specifications: {
      ...(product?.specifications || {}),
      Brand: product?.specifications?.Brand || product?.brand || 'Tech Brand',
      Category: product?.specifications?.Category || product?.category || 'Technology',
      Stock: stock,
      Availability: 'In stock',
    },
  };
}

function normalizeCartItem(product, quantity = 1) {
  const normalized = normalizeProduct(product);

  return {
    id: normalized.id,
    productId: normalized.productId,
    title: normalized.title,
    brand: normalized.brand,
    category: normalized.category,
    price: normalized.price,
    rating: normalized.rating,
    image: normalized.image,
    stock: normalized.stock,
    availability: 'In stock',
    quantity: Math.max(1, Number(quantity) || 1),
    source: normalized.source,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        ...action.payload,
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };

    case 'TOAST':
      return {
        ...state,
        toast: action.payload,
      };

    case 'CLEAR_TOAST':
      return {
        ...state,
        toast: null,
      };

    case 'OPEN_AUTH':
      return {
        ...state,
        authModal: {
          open: true,
          mode: action.payload || 'login',
        },
      };

    case 'CLOSE_AUTH':
      return {
        ...state,
        authModal: {
          ...state.authModal,
          open: false,
        },
      };

    case 'SET_AUTH_MODE':
      return {
        ...state,
        authModal: {
          ...state.authModal,
          mode: action.payload,
        },
      };

    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        authModal: {
          ...state.authModal,
          open: false,
        },
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };

    case 'ADD_TO_CART': {
      const item = normalizeCartItem(action.payload.product, action.payload.quantity);
      const exists = state.cart.find((cartItem) => cartItem.id === item.id);

      if (exists) {
        return {
          ...state,
          cart: state.cart.map((cartItem) =>
            cartItem.id === item.id
              ? {
                  ...cartItem,
                  quantity: Math.min(cartItem.quantity + item.quantity, cartItem.stock || 25),
                  availability: 'In stock',
                  stock: cartItem.stock || 25,
                }
              : cartItem
          ),
        };
      }

      return {
        ...state,
        cart: [...state.cart, item],
      };
    }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };

    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                quantity: Math.max(1, Math.min(Number(action.payload.quantity) || 1, item.stock || 25)),
                availability: 'In stock',
              }
            : item
        ),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
      };

    case 'TOGGLE_WISHLIST': {
      const product = normalizeProduct(action.payload);
      const id = getProductKey(product);
      const exists = state.wishlist.some((item) => getProductKey(item) === id);

      if (exists) {
        return {
          ...state,
          wishlist: state.wishlist.filter((item) => getProductKey(item) !== id),
        };
      }

      return {
        ...state,
        wishlist: [...state.wishlist, product],
      };
    }

    case 'REMOVE_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter((item) => getProductKey(item) !== action.payload),
      };

    case 'ADD_TO_COMPARE': {
      const product = normalizeProduct(action.payload);
      const id = getProductKey(product);
      const exists = state.compare.some((item) => getProductKey(item) === id);

      if (exists) {
        return {
          ...state,
          compareOpen: true,
        };
      }

      const nextCompare = [product, ...state.compare].slice(0, 4);

      return {
        ...state,
        compare: nextCompare,
        compareOpen: true,
      };
    }

    case 'REMOVE_FROM_COMPARE':
      return {
        ...state,
        compare: state.compare.filter((item) => getProductKey(item) !== action.payload),
      };

    case 'CLEAR_COMPARE':
      return {
        ...state,
        compare: [],
        compareOpen: false,
      };

    case 'OPEN_COMPARE':
      return {
        ...state,
        compareOpen: true,
      };

    case 'CLOSE_COMPARE':
      return {
        ...state,
        compareOpen: false,
      };

    case 'ADD_RECENT_SEARCH': {
      const value = String(action.payload || '').trim();

      if (!value) {
        return state;
      }

      const next = [value, ...state.recentSearches.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 8);

      return {
        ...state,
        recentSearches: next,
      };
    }

    case 'ADD_RECENTLY_VIEWED': {
      const product = action.payload;

      if (!product) {
        return state;
      }

      const normalized = normalizeProduct(product);
      const id = getProductKey(normalized);

      if (!id) {
        return state;
      }

      const next = [
        normalized,
        ...state.recentlyViewed.filter((item) => getProductKey(item) !== id),
      ].slice(0, 8);

      return {
        ...state,
        recentlyViewed: next,
      };
    }

    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const savedTheme = readStorage(STORAGE_KEYS.theme, 'dark');

    dispatch({
      type: 'HYDRATE',
      payload: {
        cart: readStorage(STORAGE_KEYS.cart, []),
        wishlist: readStorage(STORAGE_KEYS.wishlist, []),
        compare: readStorage(STORAGE_KEYS.compare, []),
        user: readStorage(STORAGE_KEYS.user, null),
        theme: savedTheme,
        recentSearches: readStorage(STORAGE_KEYS.recentSearches, []),
        recentlyViewed: readStorage(STORAGE_KEYS.recentlyViewed, []),
      },
    });

    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.cart, state.cart);
  }, [state.cart]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.wishlist, state.wishlist);
  }, [state.wishlist]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.compare, state.compare);
  }, [state.compare]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.user, state.user);
  }, [state.user]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.theme, state.theme);
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.recentSearches, state.recentSearches);
  }, [state.recentSearches]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.recentlyViewed, state.recentlyViewed);
  }, [state.recentlyViewed]);

  useEffect(() => {
    if (!state.toast) {
      return undefined;
    }

    const timer = setTimeout(() => {
      dispatch({ type: 'CLEAR_TOAST' });
    }, 3000);

    return () => clearTimeout(timer);
  }, [state.toast]);

  const cartCount = useMemo(
    () => state.cart.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [state.cart]
  );

  const cartSubtotal = useMemo(
    () => state.cart.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 1), 0),
    [state.cart]
  );

  const wishlistCount = state.wishlist.length;
  const compareCount = state.compare.length;

  const showToast = useCallback((message, type = 'success') => {
    dispatch({
      type: 'TOAST',
      payload: {
        message,
        type,
        id: Date.now(),
      },
    });
  }, []);

  const addToCart = useCallback(
    (product, quantity = 1) => {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          product: normalizeProduct(product),
          quantity,
        },
      });

      showToast(`${product?.title || 'Product'} added to cart`, 'success');
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    (id) => {
      dispatch({
        type: 'REMOVE_FROM_CART',
        payload: id,
      });

      showToast('Product removed from cart', 'info');
    },
    [showToast]
  );

  const updateCartQuantity = useCallback((id, quantity) => {
    dispatch({
      type: 'UPDATE_CART_QUANTITY',
      payload: {
        id,
        quantity,
      },
    });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({
      type: 'CLEAR_CART',
    });

    showToast('Cart cleared successfully', 'info');
  }, [showToast]);

  const isInWishlist = useCallback(
    (productOrId) => {
      const id = typeof productOrId === 'string' ? productOrId : getProductKey(productOrId);
      return state.wishlist.some((item) => getProductKey(item) === id);
    },
    [state.wishlist]
  );

  const toggleWishlist = useCallback(
    (product) => {
      const id = getProductKey(product);
      const alreadySaved = state.wishlist.some((item) => getProductKey(item) === id);

      dispatch({
        type: 'TOGGLE_WISHLIST',
        payload: normalizeProduct(product),
      });

      showToast(alreadySaved ? 'Removed from wishlist' : 'Added to wishlist', alreadySaved ? 'info' : 'success');
    },
    [state.wishlist, showToast]
  );

  const moveWishlistToCart = useCallback(
    (product) => {
      addToCart(product, 1);
      dispatch({
        type: 'REMOVE_WISHLIST',
        payload: getProductKey(product),
      });
    },
    [addToCart]
  );

  const addToCompare = useCallback(
    (product) => {
      const id = getProductKey(product);
      const alreadyCompared = state.compare.some((item) => getProductKey(item) === id);

      dispatch({
        type: 'ADD_TO_COMPARE',
        payload: normalizeProduct(product),
      });

      showToast(
        alreadyCompared
          ? 'Product is already in comparison'
          : 'Product added to comparison',
        alreadyCompared ? 'info' : 'success'
      );
    },
    [state.compare, showToast]
  );

  const removeFromCompare = useCallback((id) => {
    dispatch({
      type: 'REMOVE_FROM_COMPARE',
      payload: id,
    });
  }, []);

  const clearCompare = useCallback(() => {
    dispatch({
      type: 'CLEAR_COMPARE',
    });

    showToast('Comparison cleared', 'info');
  }, [showToast]);

  const openCompare = useCallback(() => {
    dispatch({
      type: 'OPEN_COMPARE',
    });
  }, []);

  const closeCompare = useCallback(() => {
    dispatch({
      type: 'CLOSE_COMPARE',
    });
  }, []);

  const isInCompare = useCallback(
    (productOrId) => {
      const id = typeof productOrId === 'string' ? productOrId : getProductKey(productOrId);
      return state.compare.some((item) => getProductKey(item) === id);
    },
    [state.compare]
  );

  const login = useCallback(
    (payload) => {
      const user = normalizeUser(payload);

      dispatch({
        type: 'LOGIN',
        payload: user,
      });

      showToast(`Welcome back, ${user.name}`, 'success');
    },
    [showToast]
  );

  const signup = useCallback(
    (payload) => {
      const user = normalizeUser(payload);

      dispatch({
        type: 'LOGIN',
        payload: user,
      });

      showToast(`Welcome, ${user.name}. Account created successfully`, 'success');
    },
    [showToast]
  );

  const logout = useCallback(() => {
    dispatch({
      type: 'LOGOUT',
    });

    showToast('Logged out successfully', 'info');
  }, [showToast]);

  const updateUser = useCallback(
    (payload) => {
      dispatch({
        type: 'UPDATE_USER',
        payload,
      });

      showToast('Profile updated successfully', 'success');
    },
    [showToast]
  );

  const openAuth = useCallback((mode = 'login') => {
    dispatch({
      type: 'OPEN_AUTH',
      payload: mode,
    });
  }, []);

  const closeAuth = useCallback(() => {
    dispatch({
      type: 'CLOSE_AUTH',
    });
  }, []);

  const setAuthMode = useCallback((mode) => {
    dispatch({
      type: 'SET_AUTH_MODE',
      payload: mode,
    });
  }, []);

  const toggleTheme = useCallback(() => {
    dispatch({
      type: 'SET_THEME',
      payload: state.theme === 'dark' ? 'light' : 'dark',
    });
  }, [state.theme]);

  const addRecentSearch = useCallback((query) => {
    dispatch({
      type: 'ADD_RECENT_SEARCH',
      payload: query,
    });
  }, []);

  const addRecentlyViewed = useCallback((product) => {
    dispatch({
      type: 'ADD_RECENTLY_VIEWED',
      payload: product,
    });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      cartCount,
      cartSubtotal,
      wishlistCount,
      compareCount,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      moveWishlistToCart,
      addToCompare,
      removeFromCompare,
      clearCompare,
      openCompare,
      closeCompare,
      isInCompare,
      login,
      signup,
      logout,
      updateUser,
      openAuth,
      closeAuth,
      setAuthMode,
      toggleTheme,
      showToast,
      addRecentSearch,
      addRecentlyViewed,
    }),
    [
      state,
      cartCount,
      cartSubtotal,
      wishlistCount,
      compareCount,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      moveWishlistToCart,
      addToCompare,
      removeFromCompare,
      clearCompare,
      openCompare,
      closeCompare,
      isInCompare,
      login,
      signup,
      logout,
      updateUser,
      openAuth,
      closeAuth,
      setAuthMode,
      toggleTheme,
      showToast,
      addRecentSearch,
      addRecentlyViewed,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error('useStore must be used inside StoreProvider');
  }

  return context;
}

export default StoreContext;