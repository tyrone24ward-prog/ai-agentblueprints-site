import { mkdirSync, readdirSync, renameSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const resourcesRoot = path.join(root, "public", "resources");
const unassignedDir = path.join(resourcesRoot, "_unassigned");
const shouldFix = process.argv.includes("--fix");

const expectedMap = {
  "product-core": [
    "Welcome_to_AgentBlueprints.pdf",
    "Product_Overview_README.pdf",
    "How_to_Use_This_Portal.pdf",
    "Quick_Start_Checklist.pdf",
  ],
  "core-setup-guides/bland": [
    "Bland_Setup_Instructions.pdf",
    "Bland_AI_Appointment_Setter_Template.pdf",
  ],
  "core-setup-guides/retell": [
    "Retell_Setup_Instructions.pdf",
    "Retell_AI_Appointment_Setter_Template.pdf",
  ],
  "core-setup-guides/vapi": [
    "Vapi_Setup_Instructions.pdf",
    "Vapi_AI_Appointment_Setter_Template.pdf",
  ],
  "agent-templates": [
    "Agent_Template_Overview.pdf",
    "Template_Import_Instructions.pdf",
    "AI_Appointment_Setter_Data_Capture_Library.pdf",
    "AI_Conversation_Recovery_Library.pdf",
    "Master_Appointment_Setter_Prompt.pdf",
  ],
  "customization-guide": ["Customization_Guide.pdf"],
  "industry-customization": ["Industry_Customization_Examples.pdf"],
  deployment: ["Deployment_Checklist.pdf"],
  troubleshooting: ["Troubleshooting_Guide.pdf"],
  "best-practices": ["AI_Agent_Best_Practices.pdf"],
};

const readPdfFiles = (relativeDir) => {
  const absDir = path.join(resourcesRoot, relativeDir);
  const items = readdirSync(absDir, { withFileTypes: true });
  return items
    .filter((item) => item.isFile() && item.name.toLowerCase().endsWith(".pdf"))
    .map((item) => item.name);
};

const errors = [];

for (const [dir, expectedFiles] of Object.entries(expectedMap)) {
  const actualFiles = readPdfFiles(dir);
  const missing = expectedFiles.filter((file) => !actualFiles.includes(file));
  const extra = actualFiles.filter((file) => !expectedFiles.includes(file));

  if (missing.length || extra.length) {
    errors.push({ dir, missing, extra });
  }

  if (shouldFix && extra.length) {
    mkdirSync(unassignedDir, { recursive: true });
    for (const fileName of extra) {
      const src = path.join(resourcesRoot, dir, fileName);
      if (!statSync(src).isFile()) {
        continue;
      }
      const dest = path.join(unassignedDir, fileName);
      renameSync(src, dest);
    }
  }
}

if (!errors.length) {
  console.log("Resource map is valid.");
  process.exit(0);
}

for (const entry of errors) {
  console.log(`[${entry.dir}]`);
  console.log(`  missing: ${entry.missing.length ? entry.missing.join(", ") : "none"}`);
  console.log(`  extra: ${entry.extra.length ? entry.extra.join(", ") : "none"}`);
}

if (shouldFix) {
  console.log("Extra files were moved to public/resources/_unassigned.");
}

process.exit(1);
