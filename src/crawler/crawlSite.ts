import * as cheerio from "cheerio";
import { createHash } from "crypto";

export interface PageScriptRef {
  id: string; // external URL or inline@sha256:<hash>
  type: "external" | "inline";
}

export interface PageResult {
  url: string;
  scripts: PageScriptRef[];
}

function normaliseInternalLink(
  href: string,
  rootOrigin: string,
  currentUrl: string
): string | null {
  try {
    if (!href) return null;

    if (
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.toLowerCase().startsWith("javascript:")
    ) {
      return null;
    }

    let absolute: URL;

    if (href.startsWith("http://") || href.startsWith("https://")) {
      const u = new URL(href);
      if (u.origin !== rootOrigin) return null;
      absolute = u;
    } else if (href.startsWith("/")) {
      absolute = new URL(rootOrigin + href);
    } else {
      const base = new URL(currentUrl);
      absolute = new URL(href, base);
    }

    absolute.hash = "";
    return absolute.toString();
  } catch {
    return null;
  }
}

function makeScriptId($: any, el: any, pageUrl: string): PageScriptRef {
  const script = $(el);
  const src = script.attr("src");

  if (src) {
    const abs = new URL(src, pageUrl).toString();
    return {
      id: abs,
      type: "external",
    };
  }

  const code = script.html() || "";
  const hash = createHash("sha256").update(code).digest("hex");

  return {
    id: `inline@sha256:${hash}`,
    type: "inline",
  };
}

export async function crawlSite(
  rootUrl: string,
  maxPages = 10
): Promise<PageResult[]> {
  const rootOrigin = new URL(rootUrl).origin;

  const toVisit: string[] = [rootUrl];
  const visited = new Set<string>();
  const results: PageResult[] = [];

  while (toVisit.length > 0 && visited.size < maxPages) {
    const url = toVisit.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    console.log(`🌐 Crawling ${url}`);

    let res: Response;
    try {
      res = await fetch(url);
    } catch (err) {
      console.error(`  ⚠️ Failed to fetch ${url}: ${(err as Error).message}`);
      continue;
    }

    if (!res.ok) {
      console.error(`  ⚠️ HTTP ${res.status} for ${url}`);
      continue;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Collect scripts
    const scripts: PageScriptRef[] = [];
    $("script").each((i, el) => {
      const ref = makeScriptId($, el, url);
      scripts.push(ref);
    });

    results.push({ url, scripts });

    // Collect internal links
    $("a[href]").each((i, el) => {
      const href = $(el).attr("href");
      const normalised = normaliseInternalLink(href || "", rootOrigin, url);

      if (!normalised) return;
      if (!visited.has(normalised) && !toVisit.includes(normalised)) {
        toVisit.push(normalised);
      }
    });
  }

  return results;
}