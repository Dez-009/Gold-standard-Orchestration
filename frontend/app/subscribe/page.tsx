'use client';

// Subscription plans page located at /subscribe
// Fetches pricing info and initiates Stripe Checkout sessions
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  fetchPricingPlans,
  createCheckoutSession
} from '../../services/billingService';
import { getToken, isTokenExpired } from '../../services/authUtils';
import { fetchAccountDetails } from '../../services/accountService';
import { showError } from '../../components/ToastProvider';
import { trackEvent } from '../../services/analyticsService';

// Shape describing each pricing option
interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

export default function SubscribePage() {
  const router = useRouter(); // Notes: Used for navigation redirects
  const [plans, setPlans] = useState<Plan[]>([]); // Notes: Available plans
  const [loading, setLoading] = useState(true); // Notes: Plan fetch status
  const [creating, setCreating] = useState(false); // Notes: Checkout creation status
  const [error, setError] = useState(''); // Notes: Store fetch errors

  // On mount verify auth, check subscription and load plans
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
      // Notes: Redirect to login when the session is invalid
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    // Notes: Record that the subscribe page was viewed
    trackEvent('page_view', { page: 'subscribe' });
    const init = async () => {
      try {
        // Notes: Redirect subscribers away from this page
        const account = await fetchAccountDetails();
        if (account.tier && account.tier !== 'Free') {
          router.push('/dashboard');
          return;
        }
      } catch {
        // Ignore account lookup failures and proceed
      }
      try {
        // Notes: Retrieve pricing data for display
        const data = await fetchPricingPlans();
        setPlans(data);
      } catch {
        setError('Failed to load plans');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  // Kick off Checkout session then redirect to Stripe hosted page
  const handleSubscribe = async (planId: string) => {
    setCreating(true);
    try {
      const { url } = await createCheckoutSession(planId);
      if (url) {
        // Notes: Emit an event when checkout session is started
        trackEvent('subscription_upgrade', { plan_id: planId });
        window.location.href = url;
      }
    } catch {
      showError('Failed to create checkout session');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 space-y-4">
      {/* Link back to dashboard */}
      <Link href="/dashboard" className="self-start text-blue-600 underline">
        Back to Dashboard
      </Link>
      {/* Page heading */}
      <h1 className="text-2xl font-bold">Choose a Plan</h1>
      {/* Show spinner while loading plan data */}
      {loading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      )}
      {/* Display fetch errors */}
      {error && <p className="text-red-600">{error}</p>}
      {/* Show message when no plans exist */}
      {!loading && plans.length === 0 && <p>No plans available.</p>}
      {/* Pricing tiers laid out in a responsive grid */}
      <div className="grid md:grid-cols-2 gap-4 w-full max-w-3xl">
        {plans.map((plan) => (
          <div key={plan.id} className="border rounded p-4 flex flex-col">
            <h2 className="text-xl font-semibold capitalize">{plan.name}</h2>
            <p className="text-3xl font-bold mt-2">
              ${'{'}plan.price{'}'} <span className="text-base font-normal">/{plan.interval}</span>
            </p>
            <ul className="flex-1 mt-4 space-y-1 text-sm list-disc list-inside">
              {plan.features.map((feat, idx) => (
                <li key={idx}>{feat}</li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={creating}
              className="mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {creating ? 'Processing...' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
