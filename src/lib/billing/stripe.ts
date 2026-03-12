import Stripe from "stripe";

import { STRIPE_SECRET_KEY, isStripeConfigured } from "@/lib/billing/config";

let stripeClient: Stripe | null = null;

export const getStripeServerClient = () => {
  if (!isStripeConfigured) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(STRIPE_SECRET_KEY);
  }

  return stripeClient;
};
