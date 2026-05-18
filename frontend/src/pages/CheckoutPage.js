import Checkout from '../components/Checkout';

function CheckoutPage({ step }) {
  return <Checkout initialStep={step || 'checkout'} />;
}

export default CheckoutPage;
