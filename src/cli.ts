import * as cheerio from "cheerio";

// Read the URL from command line arguments
const urlArg = process.argv[2];

if (!urlArg) {
  console.error("❌ Please provide a URL, e.g.");
  console.error("   npm run dev https://www.bbc.co.uk");
  process.exit(1);
}

async function main(url: string) {
  console.log("🔍 Fetching page:", url);

  // Fetch HTML
  const res = await fetch(url);

  if (!res.ok) {
    console.error(`❌ HTTP error ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const html = await res.text();

  // Parse HTML
  const $ = cheerio.load(html);

  // Collect scripts
  const scripts: string[] = [];

  $("script").each((i, elem) => {
    const src = $(elem).attr("src");

    if (src) {
      scripts.push(`external: ${src}`);
    } else {
      scripts.push("inline script");
    }
  });

  console.log("📄 Script tags found:");
  scripts.forEach((s) => console.log(" - " + s));

  console.log(`\nTotal scripts found: ${scripts.length}`);
}

// Call main with a definite string
main(urlArg);
