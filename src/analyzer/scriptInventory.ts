import { PageResult, PageScriptRef } from "../crawler/crawlSite";

export interface ScriptInventoryEntry {
  id: string;
  type: "external" | "inline";
  origin: "first-party" | "third-party";
  pagesUsedOn: string[];
  usageCount: number;

  // Metrics added in this step
  sizeBytes?: number;
  linesOfCode?: number;
  functionCount?: number;
  complexityBucket?: string;
}

export interface ScriptInventory {
  [scriptId: string]: ScriptInventoryEntry;
}

function classifyOrigin(id: string, siteOrigin: string): "first-party" | "third-party" {
  if (id.startsWith("inline@sha256:")) return "first-party";

  try {
    const u = new URL(id);
    return u.origin === siteOrigin ? "first-party" : "third-party";
  } catch {
    return "third-party";
  }
}

export function buildScriptInventory(rootUrl: string, pages: PageResult[]): ScriptInventory {
  const siteOrigin = new URL(rootUrl).origin;
  const inventory: ScriptInventory = {};

  for (const page of pages) {
    for (const script of page.scripts) {
      const id = script.id;

      if (!inventory[id]) {
        inventory[id] = {
          id,
          type: script.type,
          origin: classifyOrigin(id, siteOrigin),
          pagesUsedOn: [],
          usageCount: 0,
        };
      }

      inventory[id].usageCount++;
      inventory[id].pagesUsedOn.push(page.url);
    }
  }

  return inventory;
}
