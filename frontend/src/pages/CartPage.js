import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Chatbot from '../components/Chatbot';

function formatPrice(price) {
  return `$${Number(price || 0).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })}`;
}

function CartPage() {
  const navigate = useNavigate();

  const {
    cart,
    cartSubtotal,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    showToast,
  } = useStore();

  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart');
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    street: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const discount = couponApplied ? cartSubtotal * 0.1 : 0;
  const shipping = cartSubtotal > 0 ? 0 : 0;
  const tax = Math.max(0, (cartSubtotal - discount) * 0.05);
  const total = Math.max(0, cartSubtotal - discount + shipping + tax);

  const canCheckout = cart.length > 0;

  const progressItems = [
    { key: 'cart', label: 'Cart' },
    { key: 'checkout', label: 'Address' },
    { key: 'payment', label: 'Payment' },
    { key: 'done', label: 'Done' },
  ];

  const activeStepIndex = progressItems.findIndex((item) => item.key === checkoutStep);

  const addressComplete = useMemo(() => {
    return address.name && address.phone && address.email && address.city && address.street;
  }, [address]);

  const applyCoupon = () => {
    if (!coupon.trim()) {
      showToast('Please enter a coupon code', 'error');
      return;
    }

    if (coupon.trim().toUpperCase() === 'TECH10') {
      setCouponApplied(true);
      showToast('Coupon applied successfully. 10% discount added.', 'success');
      return;
    }

    showToast('Invalid coupon. Try TECH10 for demo discount.', 'error');
  };

  const proceedToCheckout = () => {
    if (!canCheckout) {
      showToast('Your cart is empty', 'error');
      return;
    }

    setCheckoutStep('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const proceedToPayment = () => {
    if (!addressComplete) {
      showToast('Please complete all address fields before payment', 'error');
      return;
    }

    setCheckoutStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const placeOrder = () => {
    setCheckoutStep('done');
    clearCart();
    showToast('Order placed successfully', 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="cart-page" style={{ padding: '26px 0 64px' }}>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <span>Shopping Cart</span>
        </div>

        <div className="page-title-row">
          <div>
            <span className="section-eyebrow">Secure Checkout</span>
            <h1>Shopping Cart</h1>
            <p>
              Review products, apply coupon, select address and complete the demo payment flow.
            </p>
          </div>

          <Link to="/products" className="btn btn-secondary">
            Continue Shopping
          </Link>
        </div>

        <div className="card" style={{ padding: 18, marginBottom: 22 }}>
          <div className="stepper">
            {progressItems.map((item, index) => (
              <React.Fragment key={item.key}>
                <div
                  className={
                    index < activeStepIndex
                      ? 'stepper-item done'
                      : index === activeStepIndex
                      ? 'stepper-item active'
                      : 'stepper-item'
                  }
                >
                  <span className="stepper-dot">{index < activeStepIndex ? '✓' : index + 1}</span>
                  <span>{item.label}</span>
                </div>
                {index < progressItems.length - 1 && <span className="stepper-line" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {checkoutStep === 'done' ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <h3>Order placed successfully</h3>
            <p>
              Your Tech Store demo order has been created. You can now track the order using the
              order tracking page.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/track-order" className="btn btn-primary">
                Track Order
              </Link>
              <Link to="/products" className="btn btn-secondary">
                Browse More Products
              </Link>
            </div>
          </div>
        ) : (
          <div
            className="layout-with-sidebar"
            style={{
              gridTemplateColumns: 'minmax(0, 1fr) 360px',
              alignItems: 'start',
            }}
          >
            <section style={{ display: 'grid', gap: 18 }}>
              {checkoutStep === 'cart' && (
                <>
                  {cart.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-state-icon">🛒</div>
                      <h3>Your cart is empty</h3>
                      <p>Add technology products from DummyJSON dynamic listing and come back here.</p>
                      <Link to="/products" className="btn btn-primary">
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="table-card">
                      <div className="table-card-header">
                        <h3>Cart Items ({cart.length})</h3>
                        <button type="button" className="btn btn-ghost" onClick={clearCart}>
                          Clear Cart
                        </button>
                      </div>

                      <div style={{ display: 'grid', gap: 14, padding: 18 }}>
                        {cart.map((item) => (
                          <article
                            key={item.id}
                            className="card"
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '96px minmax(0, 1fr) auto',
                              gap: 16,
                              alignItems: 'center',
                              padding: 14,
                            }}
                          >
                            <img
                              src={item.image}
                              alt={item.title}
                              style={{
                                width: 96,
                                height: 82,
                                objectFit: 'contain',
                                borderRadius: 16,
                                background: 'var(--surface-2)',
                                padding: 8,
                              }}
                              onError={(event) => {
                                event.currentTarget.src =
                                  'https://dummyjson.com/image/300x200/eeeeee/111111?text=Tech';
                              }}
                            />

                            <div>
                              <span className="badge badge-primary">{item.category}</span>
                              <h3 style={{ margin: '10px 0 6px', fontSize: '1.05rem' }}>
                                {item.title}
                              </h3>
                              <p style={{ margin: 0, color: 'var(--text-soft)' }}>
                                {item.brand} · {item.availability}
                              </p>
                              <strong style={{ display: 'block', marginTop: 8 }}>
                                {formatPrice(item.price)}
                              </strong>
                            </div>

                            <div style={{ display: 'grid', justifyItems: 'end', gap: 10 }}>
                              <div className="detail-quantity">
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                >
                                  −
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => removeFromCart(item.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {checkoutStep === 'checkout' && (
                <div className="card" style={{ padding: 22 }}>
                  <h2 style={{ marginTop: 0 }}>Delivery Information</h2>
                  <p style={{ color: 'var(--text-soft)', lineHeight: 1.7 }}>
                    Fill the delivery information. Required field validation prevents checkout mistakes.
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: 14,
                    }}
                  >
                    <label className="form-field">
                      <span className="form-label">Full Name *</span>
                      <input
                        className="form-input"
                        value={address.name}
                        onChange={(event) =>
                          setAddress((value) => ({ ...value, name: event.target.value }))
                        }
                      />
                    </label>

                    <label className="form-field">
                      <span className="form-label">Phone Number *</span>
                      <input
                        className="form-input"
                        value={address.phone}
                        onChange={(event) =>
                          setAddress((value) => ({ ...value, phone: event.target.value }))
                        }
                      />
                    </label>

                    <label className="form-field">
                      <span className="form-label">Email Address *</span>
                      <input
                        type="email"
                        className="form-input"
                        value={address.email}
                        onChange={(event) =>
                          setAddress((value) => ({ ...value, email: event.target.value }))
                        }
                      />
                    </label>

                    <label className="form-field">
                      <span className="form-label">City *</span>
                      <input
                        className="form-input"
                        value={address.city}
                        onChange={(event) =>
                          setAddress((value) => ({ ...value, city: event.target.value }))
                        }
                      />
                    </label>

                    <label className="form-field" style={{ gridColumn: '1 / -1' }}>
                      <span className="form-label">Street Address *</span>
                      <textarea
                        className="form-textarea"
                        value={address.street}
                        onChange={(event) =>
                          setAddress((value) => ({ ...value, street: event.target.value }))
                        }
                      />
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setCheckoutStep('cart')}>
                      Back to Cart
                    </button>
                    <button type="button" className="btn btn-primary" onClick={proceedToPayment}>
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {checkoutStep === 'payment' && (
                <div className="card" style={{ padding: 22 }}>
                  <h2 style={{ marginTop: 0 }}>Payment Method</h2>
                  <p style={{ color: 'var(--text-soft)', lineHeight: 1.7 }}>
                    This is a safe FYP demo payment screen. No real payment is charged.
                  </p>

                  <div style={{ display: 'grid', gap: 10 }}>
                    {['Cash on Delivery', 'Credit / Debit Card', 'JazzCash', 'EasyPaisa', 'Bank Transfer'].map(
                      (method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className="card"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            minHeight: 58,
                            padding: '0 16px',
                            borderColor: paymentMethod === method ? 'var(--primary)' : 'var(--border)',
                            color: paymentMethod === method ? 'var(--primary)' : 'var(--text)',
                            fontWeight: 900,
                          }}
                        >
                          <span>{method}</span>
                          <span>{paymentMethod === method ? '●' : '○'}</span>
                        </button>
                      )
                    )}
                  </div>

                  {paymentMethod === 'Credit / Debit Card' && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr',
                        gap: 12,
                        marginTop: 16,
                      }}
                    >
                      <input className="form-input" placeholder="Card number" />
                      <input className="form-input" placeholder="MM/YY" />
                      <input className="form-input" placeholder="CVV" />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setCheckoutStep('checkout')}
                    >
                      Back to Address
                    </button>
                    <button type="button" className="btn btn-primary" onClick={placeOrder}>
                      Confirm Order
                    </button>
                  </div>
                </div>
              )}
            </section>

            <aside className="sidebar-panel">
              <h2 style={{ margin: '0 0 14px' }}>Order Summary</h2>

              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <strong>{formatPrice(cartSubtotal)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Discount</span>
                  <strong style={{ color: 'var(--success)' }}>-{formatPrice(discount)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Shipping</span>
                  <strong>{shipping === 0 ? 'Free' : formatPrice(shipping)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tax</span>
                  <strong>{formatPrice(tax)}</strong>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border)',
                  marginTop: 16,
                  paddingTop: 16,
                  fontSize: '1.2rem',
                }}
              >
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>

              {checkoutStep === 'cart' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, marginTop: 18 }}>
                    <input
                      className="form-input"
                      placeholder="Coupon TECH10"
                      value={coupon}
                      onChange={(event) => setCoupon(event.target.value)}
                    />
                    <button type="button" className="btn btn-secondary" onClick={applyCoupon}>
                      Apply
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 16 }}
                    disabled={!canCheckout}
                    onClick={proceedToCheckout}
                  >
                    Proceed to Checkout
                  </button>
                </>
              )}

              <div
                className="badge badge-success"
                style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
              >
                🔒 Secure demo checkout
              </div>
            </aside>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 980px) {
          .cart-page .layout-with-sidebar {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 680px) {
          .cart-page article.card {
            grid-template-columns: 1fr !important;
          }

          .cart-page article.card img {
            width: 100% !important;
            height: 180px !important;
          }

          .cart-page .form-field[style] {
            grid-column: auto !important;
          }

          .cart-page div[style*="repeat(2"] {
            grid-template-columns: 1fr !important;
          }

          .cart-page div[style*="2fr 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <Chatbot floating />
    </main>
  );
}

export default CartPage;