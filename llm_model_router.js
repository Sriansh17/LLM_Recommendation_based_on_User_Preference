import { loadModelMetrics } from './metrics_loader_from_excel.js';
import { classifyDomainLLM } from './domain_classifier_llm.js';
import { Portkey } from 'portkey-ai';

const portkey = new Portkey({
  apiKey: process.env.PORTKEY_API_KEY || 'ATbhGU2QEhE2Bp5UCeIEPsNq9Avy'
});

const MODEL_API_MAP = {
  'gpt-4o': '@openai/gpt-4o',
  'gpt-4o-mini': '@openai/gpt-4o-mini',
  'claude-opus-4-1': '@anthropic/claude-opus-4-1',
  'claude-opus-4-5': '@anthropic/claude-opus-4-1',
  'grok-4-latest': '@openai/gpt-4o',
  'grok-4-fast-reasoning': '@openai/gpt-4o-mini'
};

const responseCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000;
const API_TIMEOUT = 30000;

function getCacheKey(prompt) {
  return `response_${prompt.substring(0, 100)}`.toLowerCase();
}

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

function hybridScore(m, weights) {
  const S = normalizeSpeed(m.responseTime);
  const C = normalizeCost(m.cost);
  const Q = m.quality;
  
  const normalizedSpeed = 10 * S;
  const normalizedCost = 10 * C;
  
  return (weights.quality * Q) + (weights.latency * normalizedSpeed) + (weights.cost * normalizedCost);
}

function selectModel(models, preference) {
  let ranked;

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
      hybridScore(b, { quality: 0.6, latency: 0.4, cost: 0 }) -
      hybridScore(a, { quality: 0.6, latency: 0.4, cost: 0 })
    );
  }

  else if (preference === 'quality_cost') {
    ranked = [...models].sort((a, b) =>
      hybridScore(b, { quality: 0.6, latency: 0, cost: 0.4 }) -
      hybridScore(a, { quality: 0.6, latency: 0, cost: 0.4 })
    );
  }

  else if (preference === 'latency_cost') {
    ranked = [...models].sort((a, b) =>
      hybridScore(b, { quality: 0, latency: 0.5, cost: 0.5 }) -
      hybridScore(a, { quality: 0, latency: 0.5, cost: 0.5 })
    );
  }

  else {
    ranked = [...models].sort((a, b) =>
      finalScore(b) - finalScore(a)
    );
  }

  const best = ranked[0];
  const runnerUp = ranked[1] || ranked[0];

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
  try {
    const cacheKey = getCacheKey(userInput);
    
    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`💾 Using cached response for prompt`);
        return {
          model: modelName,
          output: cached.output,
          fromCache: true,
          responseTime: cached.responseTime
        };
      }
      responseCache.delete(cacheKey);
    }

    const apiModel = MODEL_API_MAP[modelName] || '@openai/gpt-4o';
    
    console.log(`🤖 Sending request to ${modelName}...`);
    const startTime = Date.now();
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${API_TIMEOUT}ms`)), API_TIMEOUT)
    );

    const responsePromise = portkey.chat.completions.create({
      model: apiModel,
      messages: [
        {
          role: 'user',
          content: userInput
        }
      ],
      max_tokens: 500
    });

    const response = await Promise.race([responsePromise, timeoutPromise]);
    const responseTime = Date.now() - startTime;

    const output = response.choices[0].message.content;
    console.log(`✅ Received response from ${modelName} (${responseTime}ms)`);

    responseCache.set(cacheKey, {
      output,
      timestamp: Date.now(),
      responseTime
    });

    return {
      model: modelName,
      output: output,
      fromCache: false,
      responseTime: responseTime
    };
  } catch (err) {
    console.error(`⚠️ Failed to get response from ${modelName}: ${err.message}`);
    return {
      model: modelName,
      output: `Unable to generate response from ${modelName}. Please try again.`,
      fromCache: false,
      error: true,
      responseTime: null
    };
  }
}

export async function handleRequest(userInput, preference) {
  const domain = await classifyDomainLLM(userInput);

  const models = loadModelMetrics(domain);

  const { selectedModel, explanation, comparison } =
    selectModel(models, preference);

  let response = await routeToModel(selectedModel.name, userInput);

  if (response.error) {
    console.log(`Fallback: Trying alternative model...`);
    const alternatives = models.filter(m => m.name !== selectedModel.name);
    for (const alt of alternatives) {
      const altResponse = await routeToModel(alt.name, userInput);
      if (!altResponse.error) {
        response = altResponse;
        console.log(`✅ Fallback successful with ${alt.name}`);
        break;
      }
    }
  }

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
    response: {
      model: response.model,
      output: response.output,
      actualResponseTime: response.responseTime,
      fromCache: response.fromCache || false
    }
  };
}

