import { useState } from 'react';

function OrderTrackingPage() {
  const [orderId, setOrderId] = useState('TS-2026-0042');

  const steps = ['Confirmed', 'Packed', 'In Transit', 'Out for Delivery', 'Delivered'];
  const activeStep = 2;

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="eyebrow">Order tracking</span>
            <h2>Track your order status</h2>
            <p className="muted">Visibility of system status is maintained through step indicators and timeline updates.</p>
          </div>
        </div>

        <div className="card" style={{ padding: 22, marginBottom: 20 }}>
          <div className="grid grid-2">
            <input className="input" value={orderId} onChange={(event) => setOrderId(event.target.value)} aria-label="Order ID" />
            <button className="btn btn-primary" type="button">Track Order</button>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div className="section-header">
            <div>
              <h3>Order #{orderId}</h3>
              <p className="muted">Estimated delivery: 17 May 2026</p>
            </div>
            <span className="pill">Live status</span>
          </div>

          <div className="tracking-steps">
            {steps.map((step, index) => (
              <div key={step} className={index <= activeStep ? 'active' : ''}>
                <span>{index <= activeStep ? '✓' : index + 1}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>

          <div className="map-placeholder">📍 Map View · Package moving from Islamabad hub to customer address</div>

          <div className="timeline">
            <div><span>14 May</span><p>Order confirmed and payment received.</p></div>
            <div><span>15 May</span><p>Order packed at warehouse.</p></div>
            <div><span>15 May</span><p>Dispatched from Islamabad hub.</p></div>
            <div><span>17 May</span><p>Expected delivery to customer address.</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OrderTrackingPage;
