import { loadModelMetrics } from './metrics_loader_from_excel.js';
import { classifyDomainLLM } from './domain_classifier_llm.js';

const COST_REF = 1.0;
const RT_REF = 800.0;

function normalizeCost(cost) {
  return COST_REF / cost;
}

function normalizeSpeed(rt) {
  return RT_REF / rt;
}

function percentDiff(baseline, value) {
  return ((baseline - value) / baseline) * 100;
}

function finalScore(m) {
  const S = normalizeSpeed(m.responseTime);
  const C = normalizeCost(m.cost);
  return 0.4 * m.quality + 0.3 * (10 * S) + 0.3 * (10 * C);
}

function selectModel(models, preference) {
  let ranked;

  // ---------- RANKING LOGIC ----------
  if (preference === 'quality') {
    ranked = [...models].sort((a, b) => b.quality - a.quality);
  }

  else if (preference === 'latency') {
    ranked = [...models].sort((a, b) => a.responseTime - b.responseTime);
  }

  else if (preference === 'cost') {
    ranked = [...models].sort((a, b) => a.cost - b.cost);
  }

  else if (preference === 'quality_latency') {
    ranked = [...models].sort((a, b) =>
      (b.quality / a.responseTime) - (a.quality / b.responseTime)
    );
  }

  else if (preference === 'quality_cost') {
    ranked = [...models].sort((a, b) =>
      (b.quality / a.cost) - (a.quality / b.cost)
    );
  }

  else if (preference === 'latency_cost') {
    ranked = [...models].sort((a, b) =>
      (1 / a.responseTime / a.cost) - (1 / b.responseTime / b.cost)
    );
  }

  // balanced (default)
  else {
    ranked = [...models].sort((a, b) =>
      finalScore(b) - finalScore(a)
    );
  }

  const best = ranked[0];
  const runnerUp = ranked[1] || ranked[0];

  // ---------- EXPLANATION ----------
  const qualityDelta = best.quality - runnerUp.quality;
  const costDeltaPct =
    ((runnerUp.cost - best.cost) / runnerUp.cost) * 100;
  const speedDeltaPct =
    ((runnerUp.responseTime - best.responseTime) / runnerUp.responseTime) * 100;

  return {
    selectedModel: best,
    comparison: {
      name: runnerUp.name,
      qualityDiff: qualityDelta,
      costDiff: costDeltaPct,
      speedDiff: speedDeltaPct
    },
    explanation: {
      quality:
        qualityDelta >= 0
          ? `Quality increased by ${qualityDelta.toFixed(2)}`
          : `Quality decreased by ${Math.abs(qualityDelta).toFixed(2)}`,

      cost:
        costDeltaPct >= 0
          ? `Cost decreased by ${costDeltaPct.toFixed(2)}%`
          : `Cost increased by ${Math.abs(costDeltaPct).toFixed(2)}%`,

      response_time:
        speedDeltaPct >= 0
          ? `Response time improved by ${speedDeltaPct.toFixed(2)}%`
          : `Response time worsened by ${Math.abs(speedDeltaPct).toFixed(2)}%`
    }
  };
}


async function routeToModel(modelName, userInput) {
  return {
    model: modelName,
    output: `Response from ${modelName} for: ${userInput}`
  };
}

export async function handleRequest(userInput, preference) {
  // 🔹 LLM decides the domain
  const domain = await classifyDomainLLM(userInput);

  // 🔹 Load metrics from Excel based on domain
  const models = loadModelMetrics(domain);

  const { selectedModel, explanation, comparison } =
    selectModel(models, preference);

  const response = await routeToModel(selectedModel.name, userInput);

  return {
    domain,
    selected_model: selectedModel.name,
    metrics: {
      quality: selectedModel.quality,
      responseTime: selectedModel.responseTime,
      cost: selectedModel.cost
    },
    comparison,
    explanation,
    response
  };
}

