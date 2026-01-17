import XLSX from 'xlsx';
import fs from 'fs';

const EXCEL_FILE = 'combined_all_domains.xlsx';

// Simple cache to reduce file reads
const metricsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const MODEL_NAME_MAP = {
  model_1: 'gpt-4o',
  model_2: 'gpt-4o-mini',
  model_3: 'claude-opus-4-1',
  model_4: 'claude-opus-4-5',
  model_5: 'grok-4-latest',
  model_6: 'grok-4-fast-reasoning'
};

export function loadModelMetrics(domain) {
  // Check cache first
  if (metricsCache.has(domain)) {
    const cached = metricsCache.get(domain);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`📦 Loaded metrics from cache for domain: ${domain}`);
      return cached.data;
    }
    // Cache expired, remove it
    metricsCache.delete(domain);
  }

  try {
    if (!fs.existsSync(EXCEL_FILE)) {
      throw new Error(`Metrics Excel not found: ${EXCEL_FILE}`);
    }

    console.log(`📂 Loading metrics from Excel for domain: ${domain}`);
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const domainRows = rows.filter(r => r.domain === domain);

    if (!domainRows.length) {
      throw new Error(`No metrics found for domain: ${domain}`);
    }

    const models = [];

    for (let i = 1; i <= 6; i++) {
      let q = 0, l = 0, c = 0, count = 0;

      for (const row of domainRows) {
        const quality = Number(row[`model_${i}_quality_score`]);
        const latency = Number(row[`model_${i}_latency`]);
        const cost = Number(row[`model_${i}_cost`]);

        if (!isNaN(quality) && !isNaN(latency) && !isNaN(cost)) {
          q += quality;
          l += latency;
          c += cost;
          count++;
        }
      }

      if (count === 0) continue;

      models.push({
        id: `model_${i}`,
        name: MODEL_NAME_MAP[`model_${i}`],
        quality: Number((q / count).toFixed(2)),
        responseTime: Number((l / count).toFixed(2)),
        cost: Number((c / count).toFixed(4)),
        lastUpdated: Date.now()
      });
    }

    if (models.length === 0) {
      throw new Error(`No valid models found for domain: ${domain}`);
    }

    // Cache the results
    metricsCache.set(domain, {
      data: models,
      timestamp: Date.now()
    });

    console.log(`✅ Loaded ${models.length} models for domain: ${domain}`);
    return models;

  } catch (err) {
    console.error(`❌ Error loading metrics: ${err.message}`);
    throw err;
  }
}
