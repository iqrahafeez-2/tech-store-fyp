import './Checkout.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

function Checkout({ initialStep = 'checkout' }) {
  const { cart, cartSubtotal, discount, tax, delivery, cartTotal, showToast, clearCart } = useStore();
  const [step, setStep] = useState(initialStep);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    province: '',
    deliveryMethod: 'standard',
    paymentMethod: 'card',
  });
  const [errors, setErrors] = useState({});

  const validateCheckout = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Full name is required.';
    if (!/^03\d{9}$/.test(form.phone.trim())) nextErrors.phone = 'Use a valid Pakistani mobile number like 03XXXXXXXXX.';
    if (!/\S+@\S+\.\S+/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!form.address.trim()) nextErrors.address = 'Delivery address is required.';
    if (!form.city.trim()) nextErrors.city = 'City is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const continueToPayment = () => {
    if (cart.length === 0) {
      showToast('Your cart is empty. Add products before checkout.', 'error');
      return;
    }
    if (validateCheckout()) setStep('payment');
  };

  const confirmOrder = () => {
    showToast('Order placed successfully. Tracking ID: TS-2026-0042', 'success');
    clearCart();
    setStep('success');
  };

  const stepIndex = step === 'checkout' ? 2 : step === 'payment' ? 3 : 4;

  return (
    <section className="section checkout-page">
      <div className="container">
        <div className="checkout-stepper" aria-label="Checkout progress">
          {['Cart', 'Checkout', 'Payment', 'Confirmation'].map((item, index) => (
            <div key={item} className={index + 1 <= stepIndex ? 'active' : ''}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>

        {step === 'success' ? (
          <div className="success-order card">
            <div className="success-icon">✓</div>
            <h2>Order confirmed</h2>
            <p className="muted">Your order has been placed successfully. You can track it using order ID TS-2026-0042.</p>
            <div className="success-actions">
              <Link className="btn btn-primary" to="/track-order">Track Order</Link>
              <Link className="btn btn-light" to="/products">Continue Shopping</Link>
            </div>
          </div>
        ) : (
          <div className="checkout-layout">
            <div className="checkout-form card">
              {step === 'checkout' && (
                <>
                  <div className="section-header small">
                    <div>
                      <span className="eyebrow">Delivery information</span>
                      <h2>Where should we deliver?</h2>
                    </div>
                  </div>

                  <div className="form-grid">
                    <Field label="Full Name" error={errors.name}>
                      <input className="input" value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Enter full name" />
                    </Field>
                    <Field label="Phone Number" error={errors.phone}>
                      <input className="input" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="03XXXXXXXXX" />
                    </Field>
                    <Field label="Email Address" error={errors.email}>
                      <input className="input" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="name@example.com" />
                    </Field>
                    <Field label="City" error={errors.city}>
                      <input className="input" value={form.city} onChange={(event) => updateField('city', event.target.value)} placeholder="Islamabad" />
                    </Field>
                    <Field label="Province">
                      <select className="select" value={form.province} onChange={(event) => updateField('province', event.target.value)}>
                        <option value="">Select province</option>
                        <option>Punjab</option>
                        <option>Sindh</option>
                        <option>Khyber Pakhtunkhwa</option>
                        <option>Balochistan</option>
                        <option>Islamabad Capital Territory</option>
                      </select>
                    </Field>
                    <Field label="Delivery Method">
                      <select className="select" value={form.deliveryMethod} onChange={(event) => updateField('deliveryMethod', event.target.value)}>
                        <option value="standard">Standard, 3 to 5 days, free</option>
                        <option value="express">Express, 1 to 2 days, Rs 299</option>
                        <option value="same-day">Same day, Rs 599</option>
                      </select>
                    </Field>
                    <Field label="Street Address" error={errors.address} wide>
                      <textarea value={form.address} onChange={(event) => updateField('address', event.target.value)} placeholder="House number, street, area" />
                    </Field>
                  </div>

                  <div className="checkout-actions">
                    <Link to="/cart" className="btn btn-light">Back to Cart</Link>
                    <button className="btn btn-primary" type="button" onClick={continueToPayment}>Continue to Payment</button>
                  </div>
                </>
              )}

              {step === 'payment' && (
                <>
                  <div className="section-header small">
                    <div>
                      <span className="eyebrow">Secure payment</span>
                      <h2>Select payment method</h2>
                    </div>
                  </div>

                  <div className="payment-methods">
                    {[
                      ['card', 'Credit or Debit Card', '💳'],
                      ['jazzcash', 'JazzCash', '📲'],
                      ['easypaisa', 'EasyPaisa', '📱'],
                      ['bank', 'Bank Transfer', '🏦'],
                      ['cod', 'Cash on Delivery', '💵'],
                    ].map(([value, label, icon]) => (
                      <button
                        key={value}
                        className={form.paymentMethod === value ? 'selected' : ''}
                        onClick={() => updateField('paymentMethod', value)}
                        type="button"
                      >
                        <span>{icon}</span>
                        <strong>{label}</strong>
                      </button>
                    ))}
                  </div>

                  {form.paymentMethod === 'card' && (
                    <div className="form-grid card-fields">
                      <Field label="Card Number" wide><input className="input" placeholder="**** **** **** ****" /></Field>
                      <Field label="Expiry"><input className="input" placeholder="MM/YY" /></Field>
                      <Field label="CVV"><input className="input" placeholder="***" /></Field>
                      <Field label="Cardholder Name" wide><input className="input" placeholder="Name on card" /></Field>
                    </div>
                  )}

                  <div className="checkout-actions">
                    <button className="btn btn-light" type="button" onClick={() => setStep('checkout')}>Back to Checkout</button>
                    <button className="btn btn-primary" type="button" onClick={confirmOrder}>Confirm and Pay {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cartTotal)}</button>
                  </div>
                </>
              )}
            </div>

            <aside className="order-summary card" aria-label="Order summary">
              <h3>Order Summary</h3>
              {cart.length === 0 ? (
                <p className="muted">No items in cart.</p>
              ) : (
                <div className="summary-items">
                  {cart.map((item) => (
                    <div key={item.id}>
                      <span>{item.image ? <img src={item.image} alt={item.title} style={{ width: 38, height: 38, objectFit: 'contain' }} /> : '📦'}</span>
                      <p>{item.title}<small>Qty {item.quantity}</small></p>
                      <strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency || 'USD' }).format((item.price || 0) * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
              )}
              <div className="summary-total">
                <span>Subtotal</span><strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cartSubtotal)}</strong>
                <span>Discount</span><strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(discount)}</strong>
                <span>Tax</span><strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tax)}</strong>
                <span>Delivery</span><strong>{delivery === 0 ? 'Free' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(delivery)}</strong>
                <span>Total</span><strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cartTotal)}</strong>
              </div>
              <div className="secure-note">🔒 SSL secured checkout · Error checked forms · Clear confirmation</div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

function Field({ label, error, children, wide }) {
  return (
    <label className={wide ? 'field wide' : 'field'}>
      <span>{label} <em>*</em></span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

export default Checkout;
