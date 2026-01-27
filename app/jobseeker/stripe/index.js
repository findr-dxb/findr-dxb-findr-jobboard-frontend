import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_live_51S4LIREl1CkK0bxwftxVQNZOjRBMAAZAiCmSV6EMRUQKyQCYdezC2CoYNzHfCoInZUXehhzq43Vez1yRaIpaVvWZ006QePa02o');

export default function CheckoutButton({ items }) {
  const handleCheckout = async () => {
    // call your backend to create session
    const res = await fetch('https://findr-jobboard-backend-production.up.railway.app/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (data.url) {
      // redirect to stripe hosted checkout
      window.location.href = data.url;
    } else {
      alert('Error creating checkout session');
    }
  };

  return <button onClick={handleCheckout}>Pay with Stripe</button>;
}
