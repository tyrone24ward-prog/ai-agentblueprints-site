import { Suspense } from "react";

import { CheckoutSuccessClient } from "@/components/CheckoutSuccessClient";

export default function CheckoutSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <Suspense
        fallback={
          <section className="premium-card w-full max-w-2xl rounded-2xl p-6 text-sm text-[#2f4f79] md:p-8">
            Confirming your checkout session...
          </section>
        }
      >
        <CheckoutSuccessClient />
      </Suspense>
    </main>
  );
}
