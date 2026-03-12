export type ModuleKey =
  | "product-core"
  | "core-setup-guides"
  | "agent-templates"
  | "customization-guide"
  | "industry-customization"
  | "deployment"
  | "troubleshooting"
  | "best-practices";

export type ResourceFile = {
  title: string;
  description: string;
  type: "PDF";
  slug: string;
  filePath: string;
  moduleKey: ModuleKey;
  platform?: "Bland" | "Retell" | "Vapi";
};

export type PortalModule = {
  key: ModuleKey;
  title: string;
  slug: string;
  summary: string;
  resources: ResourceFile[];
};

export const portalModules: PortalModule[] = [
  {
    key: "product-core",
    title: "Product Core",
    slug: "product-core",
    summary: "Essential starting documents to understand your portal and workflow.",
    resources: [
      {
        title: "Welcome to AgentBlueprints",
        description: "A high-level welcome and orientation for new portal members.",
        type: "PDF",
        slug: "welcome-to-agentblueprints",
        filePath: "/resources/product-core/Welcome_to_AgentBlueprints.pdf",
        moduleKey: "product-core",
      },
      {
        title: "Product Overview README",
        description: "Overview of the full product package and how each part fits together.",
        type: "PDF",
        slug: "product-overview-readme",
        filePath: "/resources/product-core/Product_Overview_README.pdf",
        moduleKey: "product-core",
      },
      {
        title: "How to Use This Portal",
        description: "Step-by-step guidance for navigating and using this portal effectively.",
        type: "PDF",
        slug: "how-to-use-this-portal",
        filePath: "/resources/product-core/How_to_Use_This_Portal.pdf",
        moduleKey: "product-core",
      },
      {
        title: "Quick Start Checklist",
        description: "A concise launch checklist to get your setup moving quickly.",
        type: "PDF",
        slug: "quick-start-checklist",
        filePath: "/resources/product-core/Quick_Start_Checklist.pdf",
        moduleKey: "product-core",
      },
    ],
  },
  {
    key: "core-setup-guides",
    title: "Core Setup Guides",
    slug: "core-setup-guides",
    summary: "Platform setup guides with matched appointment setter templates.",
    resources: [
      {
        title: "Retell Setup Instructions",
        description: "Configuration walkthrough for launching with Retell.",
        type: "PDF",
        slug: "retell-setup-instructions",
        filePath: "/resources/core-setup-guides/retell/Retell_Setup_Instructions.pdf",
        moduleKey: "core-setup-guides",
        platform: "Retell",
      },
      {
        title: "Retell AI Appointment Setter Template",
        description: "Appointment setter template tailored for Retell deployment.",
        type: "PDF",
        slug: "retell-ai-appointment-setter-template",
        filePath:
          "/resources/core-setup-guides/retell/Retell_AI_Appointment_Setter_Template.pdf",
        moduleKey: "core-setup-guides",
        platform: "Retell",
      },
      {
        title: "Vapi Setup Instructions",
        description: "Configuration walkthrough for launching with Vapi.",
        type: "PDF",
        slug: "vapi-setup-instructions",
        filePath: "/resources/core-setup-guides/vapi/Vapi_Setup_Instructions.pdf",
        moduleKey: "core-setup-guides",
        platform: "Vapi",
      },
      {
        title: "Vapi AI Appointment Setter Template",
        description: "Appointment setter template tailored for Vapi deployment.",
        type: "PDF",
        slug: "vapi-ai-appointment-setter-template",
        filePath:
          "/resources/core-setup-guides/vapi/Vapi_AI_Appointment_Setter_Template.pdf",
        moduleKey: "core-setup-guides",
        platform: "Vapi",
      },
      {
        title: "Bland Setup Instructions",
        description: "Configuration walkthrough for launching with Bland.",
        type: "PDF",
        slug: "bland-setup-instructions",
        filePath: "/resources/core-setup-guides/bland/Bland_Setup_Instructions.pdf",
        moduleKey: "core-setup-guides",
        platform: "Bland",
      },
      {
        title: "Bland AI Appointment Setter Template",
        description: "Appointment setter template tailored for Bland deployment.",
        type: "PDF",
        slug: "bland-ai-appointment-setter-template",
        filePath:
          "/resources/core-setup-guides/bland/Bland_AI_Appointment_Setter_Template.pdf",
        moduleKey: "core-setup-guides",
        platform: "Bland",
      },
    ],
  },
  {
    key: "agent-templates",
    title: "Agent Templates",
    slug: "agent-templates",
    summary: "Ready-to-use assets and prompt libraries for deployment.",
    resources: [
      {
        title: "Agent Template Overview",
        description: "A guided tour of included agent templates and ideal use cases.",
        type: "PDF",
        slug: "agent-template-overview",
        filePath: "/resources/agent-templates/Agent_Template_Overview.pdf",
        moduleKey: "agent-templates",
      },
      {
        title: "Template Import Instructions",
        description: "Instructions for importing template assets into your chosen platform.",
        type: "PDF",
        slug: "template-import-instructions",
        filePath: "/resources/agent-templates/Template_Import_Instructions.pdf",
        moduleKey: "agent-templates",
      },
      {
        title: "AI Appointment Setter Data Capture Library",
        description: "Data capture examples for appointment setter style conversations.",
        type: "PDF",
        slug: "ai-appointment-setter-data-capture-library",
        filePath:
          "/resources/agent-templates/AI_Appointment_Setter_Data_Capture_Library.pdf",
        moduleKey: "agent-templates",
      },
      {
        title: "AI Conversation Recovery Library",
        description: "Recovery messaging examples for handling objections or interruptions.",
        type: "PDF",
        slug: "ai-conversation-recovery-library",
        filePath: "/resources/agent-templates/AI_Conversation_Recovery_Library.pdf",
        moduleKey: "agent-templates",
      },
      {
        title: "Master Appointment Setter Prompt",
        description: "A foundational prompt framework for consistent appointment outcomes.",
        type: "PDF",
        slug: "master-appointment-setter-prompt",
        filePath: "/resources/agent-templates/Master_Appointment_Setter_Prompt.pdf",
        moduleKey: "agent-templates",
      },
    ],
  },
  {
    key: "customization-guide",
    title: "Customization Guide",
    slug: "customization-guide",
    summary: "Core editing principles to tailor your agents to brand and goals.",
    resources: [
      {
        title: "Customization Guide",
        description: "Best-practice customization instructions for voice, style, and flow.",
        type: "PDF",
        slug: "customization-guide",
        filePath: "/resources/customization-guide/Customization_Guide.pdf",
        moduleKey: "customization-guide",
      },
    ],
  },
  {
    key: "industry-customization",
    title: "Industry Customization",
    slug: "industry-customization",
    summary: "Examples and patterns for adapting templates by vertical.",
    resources: [
      {
        title: "Industry Customization Examples",
        description: "Cross-industry customization examples you can reuse and adapt.",
        type: "PDF",
        slug: "industry-customization-examples",
        filePath:
          "/resources/industry-customization/Industry_Customization_Examples.pdf",
        moduleKey: "industry-customization",
      },
    ],
  },
  {
    key: "deployment",
    title: "Deployment",
    slug: "deployment",
    summary: "Final go-live guidance and readiness checkpoints.",
    resources: [
      {
        title: "Deployment Checklist",
        description: "Pre-launch deployment checklist to reduce production issues.",
        type: "PDF",
        slug: "deployment-checklist",
        filePath: "/resources/deployment/Deployment_Checklist.pdf",
        moduleKey: "deployment",
      },
    ],
  },
  {
    key: "troubleshooting",
    title: "Troubleshooting",
    slug: "troubleshooting",
    summary: "Practical fixes for common setup and runtime issues.",
    resources: [
      {
        title: "Troubleshooting Guide",
        description: "Issue diagnosis and resolution guide for common blockers.",
        type: "PDF",
        slug: "troubleshooting-guide",
        filePath: "/resources/troubleshooting/Troubleshooting_Guide.pdf",
        moduleKey: "troubleshooting",
      },
    ],
  },
  {
    key: "best-practices",
    title: "Best Practices",
    slug: "best-practices",
    summary: "Recommended methods for quality conversations and stable results.",
    resources: [
      {
        title: "AI Agent Best Practices",
        description: "Operational and conversational standards for long-term performance.",
        type: "PDF",
        slug: "ai-agent-best-practices",
        filePath: "/resources/best-practices/AI_Agent_Best_Practices.pdf",
        moduleKey: "best-practices",
      },
    ],
  },
];

export const moduleNavigation = portalModules.map(({ title, slug }) => ({
  title,
  href: `/module/${slug}`,
}));

export const quickAccessFiles = [
  {
    label: "Product Core Overview",
    href: "/module/product-core",
    caption: "Start with foundational product orientation.",
  },
  {
    label: "Master Appointment Setter Prompt",
    href: "/module/agent-templates",
    caption: "Jump directly to the key prompt framework.",
  },
  {
    label: "Deployment Checklist",
    href: "/module/deployment",
    caption: "Review go-live readiness before launch.",
  },
];

export const getModuleBySlug = (slug: string) =>
  portalModules.find((module) => module.slug === slug);
