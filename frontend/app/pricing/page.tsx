"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiCheck,
  FiChevronDown,
  FiShield,
  FiStar,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";

type BillingCycle = "monthly" | "annual";

type Plan = {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  featured?: boolean;
  buttonLabel: string;
  features: string[];
  limits: string[];
};

type ComparisonRow = {
  feature: string;
  basic: boolean | string;
  standard: boolean | string;
  premium: boolean | string;
};

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    badge: "Starter",
    tagline: "Healthy habits, simplified",
    description: "Perfect for getting started with structured nutrition routines.",
    monthlyPrice: 999,
    annualPrice: 9990,
    buttonLabel: "Start Basic",
    features: [
      "Weekly AI meal plan",
      "Core meal tracking",
      "Daily reminder nudges",
      "Progress snapshots",
    ],
    limits: [
      "Email support",
      "1 profile",
      "No personal dietician chat",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    badge: "Most Popular",
    tagline: "Balanced support for consistency",
    description:
      "Ideal for users who want guided progress with stronger accountability.",
    monthlyPrice: 2999,
    annualPrice: 29990,
    featured: true,
    buttonLabel: "Choose Standard",
    features: [
      "Everything in Basic",
      "Dietician chat assistance",
      "Advanced progress analytics",
      "Weekly plan refinements",
    ],
    limits: ["Priority support", "1 profile", "Kitchen add-ons available"],
  },
  {
    id: "premium",
    name: "Premium",
    badge: "All Access",
    tagline: "Complete nutrition transformation",
    description:
      "For users who want full coaching, kitchen support, and premium insights.",
    monthlyPrice: 5999,
    annualPrice: 59990,
    buttonLabel: "Go Premium",
    features: [
      "Everything in Standard",
      "Personal dietician care",
      "Healthy kitchen priority support",
      "Deep health trend insights",
    ],
    limits: [
      "Fast-track support",
      "Family profile add-on",
      "Premium goal templates",
    ],
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "AI meal planning",
    basic: "Weekly",
    standard: "Adaptive",
    premium: "Daily personalized",
  },
  {
    feature: "Dietician support",
    basic: false,
    standard: "Chat",
    premium: "Dedicated",
  },
  {
    feature: "Healthy kitchen benefits",
    basic: false,
    standard: "Add-on",
    premium: "Priority",
  },
  {
    feature: "Progress insights",
    basic: "Basic",
    standard: "Advanced",
    premium: "Advanced + trend",
  },
  {
    feature: "Goal customization",
    basic: true,
    standard: true,
    premium: true,
  },
];

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade or downgrade anytime from your dashboard. Changes apply from your next billing cycle.",
  },
  {
    q: "Is there an annual discount?",
    a: "Yes. Annual billing gives roughly two months free compared to paying monthly.",
  },
  {
    q: "Do I need a card to start?",
    a: "You can start with card payments. For kitchen-related orders, cash on delivery is also available where applicable.",
  },
  {
    q: "What happens after I purchase?",
    a: "You are onboarded immediately with your selected plan benefits and guided next-step actions.",
  },
];

const formatPrice = (value: number) => `Rs. ${value.toLocaleString("en-IN")}`;

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center justify-center text-emerald-300">
        <FiCheck className="h-5 w-5" />
      </span>
    ) : (
      <span className="text-rose-300/80">-</span>
    );
  }

  return <span className="text-slate-100">{value}</span>;
}

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [openFaq, setOpenFaq] = useState<number>(0);

  const savingsText = useMemo(() => {
    if (billingCycle === "monthly") return "Save up to 16% with annual billing";
    return "Annual billing active";
  }, [billingCycle]);

  const handlePlanSelect = (plan: Plan) => {
    const selectedPrice = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;

    router.push(
      `/register?plan=${encodeURIComponent(plan.name)}&billing=${billingCycle}&price=${selectedPrice}`
    );
  };

  return (
    <main className="relative overflow-hidden bg-gradient-to-b from-[#12020a] via-[#18030d] to-[#0e0207] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-12 h-96 w-96 rounded-full bg-[#ff4f82]/20 blur-[110px]" />
        <div className="absolute right-[-120px] top-44 h-[30rem] w-[30rem] rounded-full bg-[#ff8caf]/15 blur-[140px]" />
      </div>

      <section className="relative mx-auto max-w-7xl px-4 pb-10 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#ff8dad]/40 bg-[#2b0616]/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#ffd3df]">
            <FiStar className="h-3.5 w-3.5" />
            Pricing Plans
          </p>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Choose Your Nutrition Growth Plan
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#ffdce6]/85 sm:text-lg">
            Transparent pricing built for every stage of your health journey. Keep the same Dietara experience, scale the support when you need more.
          </p>
        </div>

        <div className="mx-auto mt-10 flex w-full max-w-xl flex-col items-center gap-4 rounded-2xl border border-[#ff88aa]/30 bg-[rgba(44,7,20,0.72)] p-3 shadow-[0_0_35px_rgba(255,92,136,0.18)] backdrop-blur-sm sm:flex-row sm:justify-between">
          <div className="inline-flex rounded-xl border border-[#ff9fba]/30 bg-[#260412] p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-lg px-4 py-2 transition ${
                billingCycle === "monthly"
                  ? "bg-[#ff6d97] text-[#22030f]"
                  : "text-[#ffdce6]/85 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`rounded-lg px-4 py-2 transition ${
                billingCycle === "annual"
                  ? "bg-[#ff6d97] text-[#22030f]"
                  : "text-[#ffdce6]/85 hover:text-white"
              }`}
            >
              Annual
            </button>
          </div>

          <p className="text-sm font-medium text-[#ffdce6]">{savingsText}</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const currentPrice = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
            const monthlyEquivalent =
              billingCycle === "annual" ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;

            return (
              <article
                key={plan.id}
                className={`group relative rounded-3xl border p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_45px_rgba(255,92,136,0.28)] ${
                  plan.featured
                    ? "border-[#ff8dad]/70 bg-[linear-gradient(180deg,rgba(66,10,30,0.82),rgba(32,5,15,0.9))]"
                    : "border-[#ff8dad]/25 bg-[rgba(42,6,18,0.72)]"
                }`}
              >
                {plan.featured && (
                  <span className="absolute -top-3 right-5 rounded-full border border-[#ffdce6]/30 bg-[#ff6d97] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#22030f]">
                    Recommended
                  </span>
                )}

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ffc8d8]">
                      {plan.badge}
                    </p>
                    <h2 className="mt-2 text-3xl font-bold text-white">{plan.name}</h2>
                  </div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#ff91b1]/20 text-[#ffd8e3]">
                    {plan.featured ? <FiTrendingUp className="h-5 w-5" /> : <FiShield className="h-5 w-5" />}
                  </span>
                </div>

                <p className="mt-4 text-sm font-semibold text-[#ffdce6]">{plan.tagline}</p>
                <p className="mt-2 text-sm text-[#ffdce6]/75">{plan.description}</p>

                <div className="mt-6 flex items-end gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-white">
                    {formatPrice(currentPrice)}
                  </span>
                  <span className="mb-1 text-sm text-[#ffdce6]/70">
                    /{billingCycle === "monthly" ? "month" : "year"}
                  </span>
                </div>

                {billingCycle === "annual" && (
                  <p className="mt-1 text-xs font-medium text-[#ffb8cb]">
                    Equivalent to {formatPrice(monthlyEquivalent)}/month
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => handlePlanSelect(plan)}
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    plan.featured
                      ? "bg-[#ff6d97] text-[#23030f] hover:bg-[#ff85aa]"
                      : "border border-[#ff9fba]/45 bg-[#2a0614] text-[#ffe7ee] hover:bg-[#3a081b]"
                  }`}
                >
                  {plan.buttonLabel}
                </button>

                <div className="mt-6 border-t border-[#ff9fba]/20 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ffc7d8]">
                    Includes
                  </p>
                  <ul className="mt-3 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-[#ffe5ed]">
                        <FiCheck className="mt-0.5 h-4 w-4 text-emerald-300" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <ul className="mt-4 space-y-1.5 text-xs text-[#ffdce6]/70">
                    {plan.limits.map((limit) => (
                      <li key={limit}>{limit}</li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[#ff8dad]/25 bg-[rgba(38,6,16,0.78)] p-5 backdrop-blur-sm sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-2xl font-bold text-white sm:text-3xl">Plan Comparison</h3>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ff9fba]/30 bg-[#2a0614] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#ffd2df]">
              <FiZap className="h-3.5 w-3.5" />
              Quick View
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="rounded-l-xl border border-[#ff9fba]/30 bg-[#2b0615] px-4 py-3 text-left text-xs uppercase tracking-[0.16em] text-[#ffd2df]">
                    Feature
                  </th>
                  <th className="border border-[#ff9fba]/30 bg-[#2b0615] px-4 py-3 text-left text-xs uppercase tracking-[0.16em] text-[#ffd2df]">
                    Basic
                  </th>
                  <th className="border border-[#ff9fba]/30 bg-[#2b0615] px-4 py-3 text-left text-xs uppercase tracking-[0.16em] text-[#ffd2df]">
                    Standard
                  </th>
                  <th className="rounded-r-xl border border-[#ff9fba]/30 bg-[#2b0615] px-4 py-3 text-left text-xs uppercase tracking-[0.16em] text-[#ffd2df]">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature}>
                    <td className="border border-[#ff9fba]/20 bg-[#1b040d] px-4 py-3 text-sm font-medium text-white">
                      {row.feature}
                    </td>
                    <td className="border border-[#ff9fba]/20 bg-[#17030b] px-4 py-3 text-sm">
                      <FeatureValue value={row.basic} />
                    </td>
                    <td className="border border-[#ff9fba]/20 bg-[#17030b] px-4 py-3 text-sm">
                      <FeatureValue value={row.standard} />
                    </td>
                    <td className="border border-[#ff9fba]/20 bg-[#17030b] px-4 py-3 text-sm">
                      <FeatureValue value={row.premium} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-6 px-4 pb-10 pt-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div className="rounded-3xl border border-[#ff8dad]/25 bg-[rgba(41,7,18,0.74)] p-5 backdrop-blur-sm sm:p-8">
          <h3 className="text-2xl font-bold text-white sm:text-3xl">Frequently Asked Questions</h3>
          <div className="mt-6 space-y-3">
            {faqs.map((item, index) => {
              const open = openFaq === index;

              return (
                <div
                  key={item.q}
                  className="rounded-2xl border border-[#ff9fba]/25 bg-[#1a040d]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? -1 : index)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <span className="text-sm font-semibold text-[#ffe8ef] sm:text-base">
                      {item.q}
                    </span>
                    <FiChevronDown
                      className={`h-4 w-4 text-[#ffc2d4] transition ${open ? "rotate-180" : ""}`}
                    />
                  </button>

                  {open && (
                    <p className="border-t border-[#ff9fba]/20 px-4 py-3 text-sm leading-relaxed text-[#ffdce6]/85">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-[#ff8dad]/35 bg-[linear-gradient(160deg,rgba(255,109,151,0.18),rgba(37,6,17,0.92))] p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-14 h-48 w-48 rounded-full bg-[#ff7ea4]/25 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffd0dd]">
            Need a custom setup?
          </p>
          <h3 className="mt-3 text-3xl font-bold text-white">
            Let Dietara craft your personal nutrition path.
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-[#ffe6ee]/85">
            From medical conditions to body-composition goals, our experts can align your plan and meal experience with practical day-to-day outcomes.
          </p>

          <button
            type="button"
            onClick={() => router.push("/contact")}
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#ff6d97] px-5 py-3 text-sm font-semibold text-[#23030f] transition hover:bg-[#ff85aa]"
          >
            Talk To Our Team
          </button>
        </div>
      </section>
    </main>
  );
}
