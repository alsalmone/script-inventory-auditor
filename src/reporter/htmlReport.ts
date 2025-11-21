import { ScriptInventory } from "../analyzer/scriptInventory";
import { PageResult } from "../crawler/crawlSite";

export function generateHtmlReport(rootUrl: string, pages: PageResult[], inventory: ScriptInventory): string {
  const uniqueScripts = Object.values(inventory);

  const firstParty = uniqueScripts.filter(s => s.origin === "first-party").length;
  const thirdParty = uniqueScripts.filter(s => s.origin === "third-party").length;

  const summaryHtml = `
    <h1>Script Inventory Report</h1>
    <h2>Site: ${rootUrl}</h2>

    <div class="summary">
      <div class="card">Pages Crawled<br><strong>${pages.length}</strong></div>
      <div class="card">Unique Scripts<br><strong>${uniqueScripts.length}</strong></div>
      <div class="card">First-party Scripts<br><strong>${firstParty}</strong></div>
      <div class="card">Third-party Scripts<br><strong>${thirdParty}</strong></div>
    </div>
  `;

  const tableRows = uniqueScripts
    .map(s => {
      const link = s.type === "external" ? `<a href="${s.id}" target="_blank">${s.id}</a>` : s.id;

      return `
        <tr>
          <td>${link}</td>
          <td>${s.origin}</td>
          <td>${s.type}</td>
          <td>${s.sizeBytes ?? "-"}</td>
          <td>${s.linesOfCode ?? "-"}</td>
          <td>${s.functionCount ?? "-"}</td>
          <td>${s.complexityBucket ?? "-"}</td>
          <td>${s.pagesUsedOn.length}</td>
        </tr>
      `;
    })
    .join("");

  const tableHtml = `
    <table>
      <thead>
        <tr>
          <th>Script</th>
          <th>Origin</th>
          <th>Type</th>
          <th>Size (bytes)</th>
          <th>LOC</th>
          <th>Functions</th>
          <th>Complexity</th>
          <th>Usage Count</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  return `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { margin-bottom: 5px; }
        .summary { display: flex; gap: 20px; margin-bottom: 20px; }
        .card { background: #f5f5f5; padding: 10px 20px; border-radius: 5px; text-align: center; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background: #eee; }
      </style>
    </head>
    <body>
      ${summaryHtml}
      ${tableHtml}
    </body>
    </html>
  `;
}
