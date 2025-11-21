# Script Inventory Auditor (v1)

A small tool to crawl a website, inventory all JavaScript it finds, and give you a clear view of:

- How many **unique scripts** you have  
- Where they are used  
- How big they are (size, lines of code)  
- A rough idea of **complexity** (functions, simple cyclomatic score)

This is **v1** – focused purely on discovery and sizing the problem.  
**v2** will integrate a cheap LLM (e.g. DeepSeek) to analyse script *contents* for security and compliance issues.

---

## Why?

Modern sites often accumulate a mess of:

- First-party JS spread across multiple pages and bundles  
- Third-party tags, trackers, and widgets  
- Inline scripts added by various teams or CMS plugins  

If you care about security, privacy, or PCI DSS (e.g. v4 requirements 6.4.3 & 11.6.1), you first need a reliable **script inventory**. This tool gives you a measurable answer to:

> “How many scripts do I actually have, how big are they, and where are they?”

---

## Features (v1)

- 🌐 **Site crawler**
  - Start from a root URL and follow internal links
  - Configurable page limit and same-domain restriction

- 🧾 **Script inventory**
  - Detects `<script src="...">` and inline `<script>...</script>`
  - De-duplicates scripts across pages
  - Classifies scripts as **first-party** vs **third-party**

- 📏 **Script metrics**
  - Size (bytes / KB)
  - Lines of code
  - Function count
  - Rough cyclomatic complexity score → bucketed as:
    - `trivial`, `simple`, `moderate`, `complex`, `very-complex`

- 📊 **Reporting**
  - JSON output with per-script and per-site summary
  - CSV export for spreadsheets / BI tools
  - Optional HTML report for a quick visual overview

---

## Roadmap

### v1 – Script inventory & metrics

- [ ] CLI to crawl a single site
- [ ] Identify unique scripts (external + inline)
- [ ] First-party vs third-party classification
- [ ] Per-script metrics (size, LOC, functions, complexity bucket)
- [ ] Per-site summary (totals, distributions)
- [ ] JSON + CSV outputs
- [ ] Basic HTML report

### v2 – LLM-assisted script review

- [ ] Plug-in a cheap LLM (e.g. DeepSeek) for content analysis
- [ ] Summarise what each script does
- [ ] Highlight potential security/privacy issues
- [ ] Flag suspicious patterns (dynamic script loading, eval, exfil domains)
- [ ] Allow whitelisting of known-good vendor scripts

---

## Tech stack

This project uses:

- **Node.js + TypeScript**
- **Cheerio** for HTML parsing
- **node-fetch** (or native `fetch`) for HTTP requests
- **Acorn** (or similar) for JavaScript AST parsing
- A simple **CLI** interface

---

## Quick start (planned)

**This is early-stage.** The goal is:

```bash
# Crawl a site and output JSON
script-inventory-auditor crawl \
  --root-url https://www.example.com \
  --max-pages 200 \
  --out ./output/example.json

# Turn JSON into a human-readable report
script-inventory-auditor report \
  --in ./output/example.json \
  --out ./output/example-report.html
