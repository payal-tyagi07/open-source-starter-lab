#!/usr/bin/env node
import { buildChecklist, type StarterProfile } from "./checklist.js";
import { findIssueFit } from "./issueFitFinder.js";
import { issueIdeas } from "./issueIdeas.js";
import { getProgressionStep, normalizeContributorLevel } from "./progressionPath.js";

function readFlag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function printChecklist(profile: StarterProfile): void {
  const result = buildChecklist(profile);
  console.log(`Open Source Starter Lab - ${result.profile} checklist`);
  console.log(`Readiness score: ${result.score}/100\n`);

  for (const [index, item] of result.items.entries()) {
    console.log(`${index + 1}. ${item.title}`);
    console.log(`   Why: ${item.why}`);
    if (item.command) {
      console.log(`   Command: ${item.command}`);
    }
  }

  console.log(`\nNext action: ${result.nextAction}`);
}

function printIssueIdeas(): void {
  if (process.argv.includes("--json")) {
    const payload = issueIdeas.map((idea) => ({
      title: idea.title,
      label: idea.label,
      difficulty: idea.difficulty,
      goal: idea.goal,
      acceptanceCriteria: idea.acceptanceCriteria
    }));
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log("Starter issue ideas\n");
  for (const idea of issueIdeas) {
    console.log(`- ${idea.title} [${idea.label}, ${idea.difficulty}]`);
    console.log(`  Goal: ${idea.goal}`);
    console.log(`  Done when: ${idea.acceptanceCriteria.join("; ")}`);
  }
}

function printIssueFit(): void {
  const skill = readFlag("--skill") ?? "docs";
  const timeBudget = readFlag("--time") ?? "30m";
  
  // Define accepted values
  const acceptedSkills = ["html-css", "javascript", "python", "docs", "testing", "git"];
  const acceptedTimes = ["15m", "30m", "1h", "2h"];
  
  // Validate skill
  if (skill !== "docs" && !acceptedSkills.includes(skill)) {
    console.log("❌ Invalid skill value\n");
    console.log(`✅ Accepted skills: ${acceptedSkills.join(", ")}`);
    console.log(`📌 Example: fit --skill javascript --time 30m`);
    console.log(`💡 Tip: Use "docs" as a fallback for documentation tasks\n`);
    return;
  }
  
  // Validate time
  if (!acceptedTimes.includes(timeBudget)) {
    console.log("❌ Invalid time value\n");
    console.log(`✅ Accepted times: ${acceptedTimes.join(", ")}`);
    console.log(`📌 Example: fit --skill docs --time 1h`);
    console.log(`💡 Tip: Choose a time that matches your availability\n`);
    return;
  }
  
  const fit = findIssueFit(skill, timeBudget);

  console.log("🔍 First Issue Fit Finder\n");
  console.log(`📌 Best path: ${fit.title}`);
  console.log(`💪 Skill: ${fit.skill}`);
  console.log(`⏱️  Time: ${fit.timeBudget}`);
  console.log(`💡 Why it fits: ${fit.whyItFits}`);
  console.log(`🚀 First command: ${fit.firstCommand}`);
  console.log("\n📋 Accepted values:");
  console.log(`   Skills: ${acceptedSkills.join(", ")}`);
  console.log(`   Times: ${acceptedTimes.join(", ")}`);
  console.log("\n🔗 Find an issue to work on:");
  console.log(`→ Copy this URL into your browser: ${fit.issueSearchUrl}`);
  console.log("\n✅ Proof checklist:");
  for (const item of fit.proofChecklist) {
    console.log(`- ${item}`);
  }
  console.log("\n📝 Comment to paste:");
  console.log(fit.commentTemplate);
}

function printNextStep(): void {
  const level = normalizeContributorLevel(readFlag("--level") ?? "first-pr");
  const step = getProgressionStep(level);

  console.log("Contributor Progression Path\n");
  console.log(`${step.title}`);
  console.log(`Goal: ${step.goal}`);
  console.log(`First command: ${step.firstCommand}`);
  console.log(`Labels to look for: ${step.labels.join(", ")}`);
  console.log("\nGood tasks:");
  for (const task of step.goodTasks) {
    console.log(`- ${task}`);
  }
  console.log("\nProof to show:");
  for (const proof of step.proof) {
    console.log(`- ${proof}`);
  }
  console.log(`\nNext move: ${step.nextMove}`);
}

function printProfiles(): void {
  console.log("Available checklist profiles:");
  console.log("- beginner: Use this profile when you are making a first or early open-source contribution.");
  console.log("- maintainer: Use this profile when you are reviewing, organizing, or supporting contributor work.");
}

function main(): void {
  const command = process.argv[2] ?? "check";

  if (command === "check") {
    const profile = (readFlag("--profile") ?? "beginner") as StarterProfile;
    if (profile !== "beginner" && profile !== "maintainer") {
      throw new Error("Use --profile beginner or --profile maintainer");
    }
    printChecklist(profile);
    return;
  }

  if (command === "issues") {
    printIssueIdeas();
    return;
  }

  if (command === "fit") {
    printIssueFit();
    return;
  }

  if (command === "next") {
    printNextStep();
    return;
  }

  if (command === "profiles") {
    printProfiles();
    return;
  }  

  if (command === "help" || command === "--help" || command === "-h") {
    console.log("Usage:");
    console.log("  oss-lab check --profile beginner");
    console.log("  oss-lab check --profile maintainer");
    console.log("  oss-lab issues");
    console.log("  oss-lab issues --json");
    console.log("  oss-lab profiles");
    console.log("  oss-lab fit --skill docs --time 30m");
    console.log("    Skills: html-css, javascript, python, docs, testing, git");
    console.log("    Time: 15m, 30m, 1h, 2h");
    console.log("  oss-lab next --level second-pr");
    console.log("\nExamples:");
    console.log("  oss-lab fit --skill javascript --time 1h");
    console.log("  oss-lab fit --skill docs --time 30m");
    console.log("  oss-lab fit --skill python --time 2h");
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main();