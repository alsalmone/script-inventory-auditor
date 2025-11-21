# Script Inventory Auditor (v1)

A small tool to crawl a website, inventory all JavaScript it finds, and give you a clear view of:

- How many **unique scripts** you have  
- Where they are used  
- How big they are (size, lines of code)  
- A rough idea of **complexity** (functions & a simple cyclomatic score)  
- Whether they’re **first-party** or **third-party**

This is **v1** – focused on discovery and sizing the problem.  
**v2** will integrate a cheap LLM (e.g. DeepSeek) to analyse script *contents* for security and compliance issues.

---

## Why?

Modern sites accumulate a mess of:

- First-party JS spread across multiple pages and bundles  
- Third-party tags, trackers, and widgets  
- Inline scripts added by various teams or CMS plugins  

If you care about security, privacy, or PCI DSS (e.g. v4 requirements **6.4.3** & **11.6.1**), you first need a reliable **script inventory**.

This tool answers:

> “How many scripts do I actually have, how big are they, how complex are they, and where are they used?”

---

## Features (v1)

### Crawling

- 🌐 **Site crawler**
  - Start from a root URL
  - Follow internal links (same origin)
  - Configurable **max pages** to crawl

### Script inventory

- 🧾 **Script discovery**
  - Detects `<script src="...">` and inline `<script>...</script>`
  - De-duplicates scripts across pages
  - Stable IDs:
    - External scripts → **absolute URL**
    - Inline scripts → `inline@sha256:<hash>` of contents

- 🧭 **Classification**
  - **First-party** vs **third-party** based on origin
  - Tracks `pagesUsedOn[]` and `usageCount` for each script

### Metrics

- 📏 **Per-script metrics**
  - `sizeBytes` – UTF-8 byte length
  - `linesOfCode` – number of newline-separated lines
  - `functionCount` – number of functions found in AST
  - `complexityBucket` – simple score bucketed into:
    - `trivial`, `simple`, `moderate`, `complex`, `very-complex`

*(Uses `acorn` + `acorn-walk` for JS parsing. Parsing failures fall back to a default score.)*

### Reporting

- 📦 **JSON export**
  - Full crawl results (pages + script inventory + metrics)
  - Use `--json <file>` to write a JSON report

- 📄 **HTML report**
  - Summary cards (pages, unique scripts, first/third-party)
  - Table of all scripts with metrics and usage
  - Links to external script URLs
  - Use `--html <file>` to write a report you can open in a browser

---

## Tech stack

- **Node.js + TypeScript**
- **Cheerio** for HTML parsing
- **Fetch API** (Node 18+) for HTTP
- **Acorn + acorn-walk** for JS AST and metrics
- Simple **CLI** interface (no framework)

---

## Installation

### Prerequisites

- Node.js 18+  
- npm

Clone the repo and install dependencies:

```bash
git clone https://github.com/<your-username>/script-inventory-auditor.git
cd script-inventory-auditor
npm install
