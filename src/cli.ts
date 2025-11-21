import { crawlSite } from "./crawler/crawlSite";
import { buildScriptInventory } from "./analyzer/scriptInventory";
import { analyzeScript } from "./analyzer/metrics";
import { generateHtmlReport } from "./reporter/htmlReport";
import * as fs from "fs";

// ------------------------------
// Parse CLI arguments
// ------------------------------

const urlArg = process.argv[2];
const maxPagesArg = process.argv[3];

if (!urlArg) {
  console.error("❌ Please provide a URL:");
  console.error("   npm run dev -- https://www.bbc.co.uk 5 --json report.json --html report.html");
  process.exit(1);
}

const maxPages = maxPagesArg ? Number(maxPagesArg) : 10;
if (Number.isNaN(maxPages) || maxPages <= 0) {
  console.error("❌ maxPages must be a positive number.");
  process.exit(1);
}

// JSON output flag
let jsonOutputPath: string | undefined;
const jsonFlagIndex = process.argv.indexOf("--json");
if (jsonFlagIndex !== -1) {
  const candidate = process.argv[jsonFlagIndex + 1];
  if (!candidate) {
    console.error("❌ You used --json but didn't specify a file path.");
    process.exit(1);
  }
  jsonOutputPath = candidate;
}

// HTML output flag
let htmlOutputPath: string | undefined;
const htmlFlagIndex = process.argv.indexOf("--html");
if (htmlFlagIndex !== -1) {
  const candidate = process.argv[htmlFlagIndex + 1];
  if (!candidate) {
    console.error("❌ You used --html but didn't specify a file path.");
    process.exit(1);
  }
  htmlOutputPath = candidate;
}

// ------------------------------
// Main
// ------------------------------

async function main(rootUrl: string, maxPages: number) {
  console.log(`🚀 Starting crawl at ${rootUrl} (max pages: ${maxPages})\n`);

  // Crawl pages
  const pages = await crawlSite(rootUrl, maxPages);

  // Build inventory
  const inventory = buildScriptInventory(rootUrl, pages);

  // ------------------------------
  // Metrics calculation
  // ------------------------------

  console.log("\n🔍 Calculating script metrics...\n");

  for (const script of Object.values(inventory)) {
    const metrics = await analyzeScript(script.id);
    script.sizeBytes = metrics.sizeBytes;
    script.linesOfCode = metrics.linesOfCode;
    script.functionCount = metrics.functionCount;
    script.complexityBucket = metrics.complexityBucket;
  }

  // ------------------------------
  // JSON output
  // ------------------------------

  if (jsonOutputPath) {
    console.log(`\n💾 Writing JSON report to: ${jsonOutputPath} ...`);

    const output = {
      rootUrl,
      pages,
      inventory,
    };

    try {
      fs.writeFileSync(jsonOutputPath, JSON.stringify(output, null, 2), "utf8");
      console.log("✅ JSON report saved.");
    } catch (err: any) {
      console.error("❌ Failed to write JSON:", err.message);
    }
  }

  // ------------------------------
  // HTML output
  // ------------------------------

  if (htmlOutputPath) {
    console.log(`\n📄 Writing HTML report to: ${htmlOutputPath} ...`);

    const html = generateHtmlReport(rootUrl, pages, inventory);

    try {
      fs.writeFileSync(htmlOutputPath, html, "utf8");
      console.log("✅ HTML report saved.");
    } catch (err: any) {
      console.error("❌ Failed to write HTML:", err.message);
    }
  }

  // ------------------------------
  // Console summary
  // ------------------------------

  const uniqueCount = Object.keys(inventory).length;
  const firstParty = Object.values(inventory).filter(s => s.origin === "first-party").length;
  const thirdParty = Object.values(inventory).filter(s => s.origin === "third-party").length;

  console.log("\n===== Crawl summary =====");
  console.log(`Pages crawled:         ${pages.length}`);
  console.log(`Unique scripts found:  ${uniqueCount}`);
  console.log(`First-party scripts:   ${firstParty}`);
  console.log(`Third-party scripts:   ${thirdParty}`);

  console.log("\n===== Sample script entries =====");
  for (const script of Object.values(inventory).slice(0, 5)) {
    console.log(`• ${script.id}`);
    console.log(`  - origin: ${script.origin}`);
    console.log(`  - size: ${script.sizeBytes ?? "?"} bytes`);
    console.log(`  - LOC: ${script.linesOfCode ?? "?"}`);
    console.log(`  - complexity: ${script.complexityBucket ?? "-"}`);
    console.log(`  - used on ${script.pagesUsedOn.length} pages`);
  }
}

main(urlArg, maxPages);
