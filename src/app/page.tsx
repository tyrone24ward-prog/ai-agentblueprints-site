import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import StickyCta from "@/components/landing/StickyCta";
import RevealOnScroll from "@/components/landing/RevealOnScroll";

export const metadata: Metadata = {
  title: "AgentBlueprints | Deploy AI Agents Fast",
  description:
    "AgentBlueprints is a premium AI agent deployment framework with templates, prompts, setup guides, and launch checklists.",
  openGraph: {
    title: "AgentBlueprints | Deploy AI Agents Fast",
    description:
      "Launch production-ready AI agents in minutes with templates, scripts, and deployment playbooks.",
    type: "website",
    url: "/",
  },
};

export default function Home() {
  const navButtonClass =
    "rounded-full border border-transparent px-3 py-1.5 text-blue-100/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4FE3FF]/60 hover:bg-gradient-to-r hover:from-[#1F7AFF]/25 hover:to-[#4FE3FF]/20 hover:text-white hover:shadow-[0_0_0_1px_rgba(79,227,255,0.28),0_14px_30px_rgba(11,31,58,0.35),0_0_28px_rgba(79,227,255,0.30)]";
  const liftCardClass =
    "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:scale-[1.01] hover:border-[#4FE3FF]/70 hover:shadow-[0_0_0_1px_rgba(79,227,255,0.24),0_26px_44px_rgba(6,18,40,0.58),0_0_34px_rgba(79,227,255,0.28)]";

  const features = [
    "50+ AI Agent Scripts",
    "Industry Specific Blueprints",
    "Automation Workflows",
    "Sales AI Prompts",
    "Client Deployment Templates",
  ];

  const callingPlatforms = [
    { name: "Bland", status: "current" },
    { name: "Retell", status: "current" },
    { name: "Vapi", status: "current" },
    { name: "Air AI", status: "coming-soon" },
    { name: "Synthflow", status: "coming-soon" },
    { name: "Voiceflow", status: "coming-soon" },
    { name: "ElevenLabs", status: "coming-soon" },
    { name: "Twilio", status: "coming-soon" },
    { name: "Vonage", status: "coming-soon" },
    { name: "Telnyx", status: "coming-soon" },
    { name: "Plivo", status: "coming-soon" },
    { name: "Deepgram", status: "coming-soon" },
    { name: "OpenAI Realtime", status: "coming-soon" },
    { name: "Google Dialogflow", status: "coming-soon" },
    { name: "Amazon Connect", status: "coming-soon" },
    { name: "Azure AI Speech", status: "coming-soon" },
    { name: "PolyAI", status: "coming-soon" },
    { name: "NICE CXone", status: "coming-soon" },
  ] as const;

  const faqs = [
    {
      question: "Do I need coding experience to use AgentBlueprints?",
      answer:
        "No. The portal is built for operators and agencies who want production-ready assets without writing custom code.",
    },
    {
      question: "How fast can I deploy my first AI agent?",
      answer:
        "Most users launch their first setup within a single session using the quick start documents and platform-specific guides.",
    },
    {
      question: "Is this a subscription or one-time purchase?",
      answer:
        "You can start with a single purchase for individual use, or choose the agency license for broader client deployment rights.",
    },
    {
      question: "Which platforms are supported?",
      answer:
        "Current core setup guides include Bland, Retell, and Vapi with matching template resources for each.",
    },
    {
      question: "Will more templates be added later?",
      answer:
        "Yes. The system is designed to expand with additional blueprints, workflows, and specialized playbooks over time.",
    },
  ];

  const includedCategories = [
    {
      title: "Getting Started",
      resources: [
        {
          title: "Welcome to AgentBlueprints",
        },
        {
          title: "Product Overview",
        },
        {
          title: "How to Use This Portal",
        },
        {
          title: "Quick Start Checklist",
        },
      ],
    },
    {
      title: "Agent Templates & Prompts",
      resources: [
        {
          title: "Agent Template Overview",
        },
        {
          title: "Master Appointment Setter Prompt",
        },
        {
          title: "AI Appointment Setter Data Capture",
        },
        {
          title: "Conversion Recovery Library",
        },
      ],
    },
    {
      title: "Platform Setup Guides",
      resources: [
        {
          title: "Bland Setup Instructions",
        },
        {
          title: "Retell Setup Instructions",
        },
        {
          title: "Vapi Setup Instructions",
        },
      ],
    },
    {
      title: "Deployment & Optimization",
      resources: [
        {
          title: "Template Import Instructions",
        },
        {
          title: "AI Agent Best Practices",
        },
        {
          title: "Customization Guide",
        },
        {
          title: "Industry Customization Examples",
        },
        {
          title: "Deployment Checklist",
        },
        {
          title: "Troubleshooting Guide",
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[#050b16] text-white">
      <nav className="sticky top-0 z-40 border-b border-blue-300/15 bg-[#050b16]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]">
            <span className="text-white">Agent</span>
            <span className="text-[#4FE3FF]">Blueprints</span>
          </p>
          <div className="hidden items-center gap-4 text-sm text-blue-100/90 md:flex">
            <a href="#problem" className={navButtonClass}>
              Problem
            </a>
            <a href="#solution" className={navButtonClass}>
              Solution
            </a>
            <a href="#preview" className={navButtonClass}>
              Portal Preview
            </a>
            <a href="#pricing" className={navButtonClass}>
              Pricing
            </a>
            <a href="#faq" className={navButtonClass}>
              FAQ
            </a>
          </div>
        </div>
      </nav>

      <div className="bg-[radial-gradient(circle_at_0%_0%,rgba(31,122,255,0.30),transparent_35%),radial-gradient(circle_at_100%_0%,rgba(79,227,255,0.20),transparent_40%)]">
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-18 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]">
            <span className="text-white">Agent</span>
            <span className="text-[#4FE3FF]">Blueprints</span>
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl text-5xl leading-tight font-semibold tracking-tight md:text-6xl">
            Build Powerful AI Agents in Minutes, not days or hours!
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100/85">
            Download the exact AI blueprints used by top agencies.
          </p>
          <Link
            href="/pricing"
            className="mt-9 inline-flex rounded-xl bg-gradient-to-r from-[#1F7AFF] to-[#4FE3FF] px-7 py-3.5 text-base font-semibold text-white transition hover:brightness-110"
          >
            Get Instant Access
          </Link>
        </section>
      </div>

      <RevealOnScroll>
        <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <article
            id="problem"
            className={`${liftCardClass} scroll-mt-24 rounded-2xl border border-blue-400/20 bg-white/5 p-6 backdrop-blur`}
          >
            <h2 className="text-2xl font-semibold text-[#4FE3FF]">Problem</h2>
            <p className="mt-3 text-blue-100/85">
              Building out AI agents is hard. You or your employees waste hours (or days) and
              money trying to build AI agents/assistants from scratch and still might not do it
              correctly.
            </p>
          </article>
          <article
            id="solution"
            className={`${liftCardClass} scroll-mt-24 rounded-2xl border border-blue-400/20 bg-white/5 p-6 backdrop-blur`}
          >
            <h2 className="text-2xl font-semibold text-[#4FE3FF]">Solution</h2>
            <p className="mt-3 text-blue-100/85">
              AgentBlueprints provides ready-to-deploy AI scripts, workflows, and templates
              that work and get your agents up and running in minutes!
            </p>
          </article>
        </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delayMs={60}>
        <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-center text-3xl font-semibold">Everything You Need to Deploy Faster</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {features.map((feature) => (
            <div
              key={feature}
              className={`${liftCardClass} w-full max-w-[320px] rounded-xl border border-blue-400/20 bg-white/5 p-5 text-center text-blue-50 shadow-[0_8px_28px_rgba(0,0,0,0.35)]`}
            >
              <p className="font-medium">{feature}</p>
            </div>
          ))}
        </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delayMs={70}>
        <section className="mx-auto max-w-6xl px-6 py-10">
          <h2 className="text-center text-3xl font-semibold">Calling Platforms We Build For</h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-sm text-blue-100/80">
            Current template support is highlighted. Additional platforms are on the roadmap and
            marked as coming soon.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {callingPlatforms.map((platform) => {
              const isCurrent = platform.status === "current";
              return (
                <article
                  key={platform.name}
                  className={`relative rounded-xl border px-3 py-4 text-center ${
                    isCurrent
                      ? "border-[#4FE3FF]/70 bg-gradient-to-br from-[#1F7AFF]/25 to-[#4FE3FF]/20 text-white shadow-[0_0_0_1px_rgba(79,227,255,0.25),0_12px_24px_rgba(11,31,58,0.35)]"
                      : "border-blue-400/20 bg-white/5 text-blue-100/75 opacity-70"
                  }`}
                >
                  {!isCurrent && (
                    <span className="absolute top-2 right-2 rounded-full border border-blue-300/25 bg-[#0d2142]/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9fd8ff]">
                      Coming Soon
                    </span>
                  )}
                  <p className="mt-4 text-sm font-semibold">{platform.name}</p>
                </article>
              );
            })}
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delayMs={75}>
        <section className="mx-auto max-w-6xl px-6 pt-2 pb-10">
          <div className="relative">
            <div className="pointer-events-none absolute -inset-5 rounded-[28px] bg-[radial-gradient(circle_at_50%_50%,rgba(79,227,255,0.42),rgba(31,122,255,0.22),transparent_72%)] blur-3xl" />
            <article
              className={`${liftCardClass} relative rounded-2xl border border-[#4FE3FF]/65 bg-[#0c2a54]/95 px-6 pt-2 pb-4 text-white shadow-[0_0_0_1px_rgba(79,227,255,0.2),0_22px_46px_rgba(11,31,58,0.5)] md:px-8 md:pt-3 md:pb-5`}
            >
              <div className="mx-auto max-w-xl text-center">
                <div className="relative mx-auto w-full max-w-[400px]">
                  <Image
                    src="/branding/Open_Claw_e51e077f4b.png"
                    alt="OpenClaw"
                    width={400}
                    height={150}
                    className="mx-auto h-auto w-full max-w-[400px] object-contain"
                  />
                  <span
                    className="pointer-events-none absolute left-1/2 top-[64%] z-10 -translate-x-1/2 whitespace-nowrap text-center text-6xl font-black tracking-[0.08em] text-[#4FE3FF] md:text-7xl [text-shadow:0_0_14px_rgba(79,227,255,0.95),0_0_30px_rgba(79,227,255,0.88)]"
                    style={{ WebkitTextStroke: "2px #1F7AFF" }}
                  >
                    COMING SOON
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-semibold text-blue-50">
                    - Memory Repository Template to speed up searching
                  </p>
                  <p className="text-sm font-semibold text-blue-50">
                    - Full Preliminary Build Template
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delayMs={80}>
        <section id="preview" className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-center text-3xl font-semibold">Portal Preview</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div
            className={`${liftCardClass} rounded-2xl border border-blue-400/20 bg-[#0b1f3a]/70 p-4 shadow-[0_12px_34px_rgba(0,0,0,0.45)]`}
          >
            <div className="rounded-xl border border-blue-300/25 bg-[#07132a] p-3 font-mono text-[11px] text-blue-100">
              <p className="font-semibold text-[#4FE3FF]">AgentBlueprints Dashboard</p>
              <div className="mt-2">
                <p className="text-white">Start Here</p>
                <p>• Welcome to AgentBlueprints</p>
                <p>• Product Overview</p>
                <p>• How to Use This Portal</p>
                <p>• Quick Start Checklist</p>
              </div>
              <div className="mt-2">
                <p className="text-white">Templates</p>
                <p>• Agent Template Overview</p>
                <p>• Master Appointment Setter Prompt</p>
                <p>• Data Capture Framework</p>
                <p>• Conversion Recovery Library</p>
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-blue-100">Dashboard Overview</p>
            <p className="mt-2 text-xs text-blue-100/80">
              Access your full AI agent framework, templates, prompts, and deployment guides
              from a single organized dashboard.
            </p>
          </div>

          <div
            className={`${liftCardClass} rounded-2xl border border-blue-400/20 bg-[#0b1f3a]/70 p-4 shadow-[0_12px_34px_rgba(0,0,0,0.45)]`}
          >
            <div className="rounded-xl border border-blue-300/25 bg-[#07132a] p-3 font-mono text-[11px] text-blue-100">
              <p className="font-semibold text-[#4FE3FF]">Resource Library</p>
              <div className="mt-2">
                <p className="text-white">Templates</p>
                <p>• Agent Template Overview</p>
                <p>• Master Appointment Setter Prompt</p>
                <p>• Data Capture Framework</p>
              </div>
              <div className="mt-2">
                <p className="text-white">Platform Setup</p>
                <p>• Bland Setup</p>
                <p>• Retell Setup</p>
                <p>• Vapi Setup</p>
              </div>
              <div className="mt-2">
                <p className="text-white">Deployment</p>
                <p>• Customization Guide</p>
                <p>• Industry Customization Examples</p>
                <p>• Deployment Checklist</p>
                <p>• Troubleshooting Guide</p>
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-blue-100">Module Resource Library</p>
            <p className="mt-2 text-xs text-blue-100/80">
              A structured library of AI agent templates, setup guides, and deployment
              frameworks ready to copy and implement.
            </p>
          </div>

          <div
            className={`${liftCardClass} rounded-2xl border border-blue-400/20 bg-[#0b1f3a]/70 p-4 shadow-[0_12px_34px_rgba(0,0,0,0.45)]`}
          >
            <div className="rounded-xl border border-blue-300/25 bg-[#07132a] p-3 font-mono text-[11px] text-blue-100">
              <p className="font-semibold text-[#4FE3FF]">Prompt Workspace</p>
              <div className="mt-2 space-y-2">
                <div className="rounded-md border border-blue-300/20 bg-[#0c1f40] px-2 py-1.5">
                  <p className="text-white">Master Appointment Setter Prompt</p>
                  <p className="mt-1 inline-block rounded border border-[#4FE3FF]/50 px-1.5 py-0.5 text-[10px]">
                    [ Copy Prompt ]
                  </p>
                </div>
                <div className="rounded-md border border-blue-300/20 bg-[#0c1f40] px-2 py-1.5">
                  <p className="text-white">Conversion Recovery Scripts</p>
                  <p className="mt-1 inline-block rounded border border-[#4FE3FF]/50 px-1.5 py-0.5 text-[10px]">
                    [ Copy Script ]
                  </p>
                </div>
                <div className="rounded-md border border-blue-300/20 bg-[#0c1f40] px-2 py-1.5">
                  <p className="text-white">Industry Customization Examples</p>
                  <p className="mt-1 inline-block rounded border border-[#4FE3FF]/50 px-1.5 py-0.5 text-[10px]">
                    [ View Examples ]
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-blue-100">Quick Access Workspace</p>
            <p className="mt-2 text-xs text-blue-100/80">
              Instantly copy prompts, templates, and scripts to deploy AI agents in minutes
              instead of hours.
            </p>
          </div>
        </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delayMs={100}>
        <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-center text-3xl font-semibold">
          Everything Included in AgentBlueprints
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-blue-100/80">
          A complete AI agent deployment framework designed to help you launch
          production-ready agents quickly.
        </p>

        <div className="mt-8 space-y-7">
          {includedCategories.map((category) => (
            <section key={category.title}>
              <h3 className="mb-3 text-lg font-semibold text-[#4FE3FF]">
                {category.title}
              </h3>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                {category.resources.map((resource) => (
                  <article
                    key={resource.title}
                    className={`${liftCardClass} flex items-center gap-2.5 rounded-lg border border-blue-400/20 bg-[#0b1c38]/92 px-3 py-2 shadow-[0_6px_18px_rgba(0,0,0,0.3)] hover:border-[#4FE3FF]/60 hover:bg-[#0f2347]`}
                  >
                    <div className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-blue-300/25 bg-[#113060] text-xs">
                      📄
                    </div>
                    <p className="text-xs leading-tight font-semibold text-blue-50">
                      {resource.title}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delayMs={120}>
        <section id="pricing" className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-center text-3xl font-semibold">Pricing</h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-blue-100/80">
            Start with a single platform, get the full appointment setter suite, or unlock full
            portal access with expansion-ready assets.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className={`${liftCardClass} rounded-2xl border border-blue-400/20 bg-white/5 p-6`}>
              <p className="text-sm uppercase tracking-[0.2em] text-[#4FE3FF]">Single Platform</p>
              <p className="mt-4 text-4xl font-semibold">$197</p>
              <p className="mt-3 text-blue-100/80">
                Choose Bland, Retell, or Vapi template package.
              </p>
            </div>
            <div
              className={`${liftCardClass} rounded-2xl border border-blue-400/30 bg-gradient-to-br from-[#1F7AFF]/20 to-[#4FE3FF]/10 p-6`}
            >
              <p className="text-sm uppercase tracking-[0.2em] text-[#4FE3FF]">
                Appointment Setter Suite
              </p>
              <p className="mt-4 text-4xl font-semibold">$497</p>
              <p className="mt-3 text-blue-100/80">
                Includes all 3 appointment setter platforms: Bland, Retell, and Vapi.
              </p>
            </div>
            <div className={`${liftCardClass} rounded-2xl border border-blue-400/25 bg-white/5 p-6`}>
              <p className="text-sm uppercase tracking-[0.2em] text-[#4FE3FF]">Full Portal Access</p>
              <p className="mt-4 text-4xl font-semibold">$1497</p>
              <p className="mt-3 text-blue-100/80">
                Full access plus future expansion offerings as your stack grows.
              </p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/pricing"
              className="inline-flex rounded-xl bg-gradient-to-r from-[#1F7AFF] to-[#4FE3FF] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              View Plans and Purchase
            </Link>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delayMs={130}>
        <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-center text-3xl font-semibold">Testimonials</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              quote:
                "Man! My first AI Agent I did with these and it took me 3 weeks to get set up. With AgentBlueprints, I got my second one set up in 20 mins!",
              author: "Richard-CA",
            },
            {
              quote:
                "This made setting up my agents simple! Did it in 10 minutes, when it says it takes hours.",
              author: "Gabe-CA",
            },
            {
              quote: "The time these saved my staff was crucial!",
              author: "Frank-TX",
            },
          ].map((testimonial) => (
            <blockquote
              key={testimonial.author}
              className={`${liftCardClass} rounded-xl border border-blue-400/20 bg-white/5 p-5 text-blue-100/90`}
            >
              <p>{testimonial.quote}</p>
              <footer className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#4FE3FF]">
                {testimonial.author}
              </footer>
            </blockquote>
          ))}
        </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delayMs={140}>
        <section id="faq" className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="text-center text-3xl font-semibold">Frequently Asked Questions</h2>
        <div className="mt-8 space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className={`${liftCardClass} rounded-xl border border-blue-400/20 bg-white/5 p-4 open:bg-white/10`}
            >
              <summary className="cursor-pointer text-base font-medium text-white">
                {faq.question}
              </summary>
              <p className="mt-2 text-sm text-blue-100/85">{faq.answer}</p>
            </details>
          ))}
        </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delayMs={150}>
        <section className="mx-auto max-w-6xl px-6 pt-6 pb-20 text-center">
        <div className="rounded-2xl border border-blue-300/20 bg-gradient-to-r from-[#1F7AFF]/25 to-[#4FE3FF]/20 p-10">
          <h2 className="text-3xl font-semibold">Start Building AI Agents Today</h2>
          <Link
            href="/pricing"
            className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-[#1F7AFF] to-[#4FE3FF] px-7 py-3.5 text-base font-semibold text-white transition hover:brightness-110"
          >
            Get Instant Access
          </Link>
        </div>
        </section>
      </RevealOnScroll>

      <footer className="border-t border-blue-300/15 bg-[#071225]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-blue-100/80 md:flex-row">
          <p>Copyright {new Date().getFullYear()} AgentBlueprints</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="transition hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="mailto:tyrone24ward@gmail.com" className="transition hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </footer>

      <StickyCta />
    </main>
  );
}
