"""
Deterministic per-request LLM model selector
- Quality: 1–10 (static rolling score)
- Response Time: lower is faster
- Cost: raw positive value (can be >1)
- Global normalization for cost & response time
- NO minimum quality threshold
"""

from dataclasses import dataclass
from typing import List, Optional
import time
import numpy as np

# ------------------ GLOBAL BASELINES ------------------

QUALITY_TIE_DELTA = 0.2
ANTI_FLAP_DELTA = 0.5

COST_REF = 1.0      # reference acceptable cost
RT_REF = 800.0      # reference fast response time

# ------------------ DATA MODEL ------------------

@dataclass
class ModelMetrics:
    name: str
    quality: float          # 1–10
    response_time: float    # raw, lower = faster
    cost: float             # raw, can be any positive value
    last_updated: float     # metadata only

# ------------------ NORMALIZATION ------------------

def normalize_cost(cost: float) -> float:
    """
    Higher = cheaper
    """
    return COST_REF / cost


def normalize_speed(response_time: float) -> float:
    """
    Higher = faster
    """
    return RT_REF / response_time

# ------------------ MODEL SELECTION ------------------

def select_model(
    models: List[ModelMetrics],
    preference: str,
    last_selected: Optional[str] = None,
    last_score: Optional[float] = None
) -> ModelMetrics:

    if not models:
        raise RuntimeError("No models provided")

    # Precompute normalized metrics
    normalized = []
    for m in models:
        normalized.append({
            "model": m,
            "Q": m.quality,
            "S": normalize_speed(m.response_time),
            "C": normalize_cost(m.cost)
        })

    # ---------- CASES ----------

    # 1. High quality
    if preference == "quality":
        max_q = max(x["Q"] for x in normalized)
        candidates = [x for x in normalized if x["Q"] >= max_q - QUALITY_TIE_DELTA]
        chosen = max(candidates, key=lambda x: x["S"])

    # 2. Fast response
    elif preference == "latency":
        chosen = max(normalized, key=lambda x: x["S"])

    # 3. Least costly
    elif preference == "cost":
        chosen = max(normalized, key=lambda x: x["C"])

    # 4. No preference (balanced)
    elif preference == "balanced":
        def score(x):
            return 0.4*x["Q"] + 0.3*(10*x["S"]) + 0.3*(10*x["C"])
        chosen = max(normalized, key=score)

    # 5. High quality + fast
    elif preference == "quality_latency":
        q_cutoff = np.percentile([x["Q"] for x in normalized], 90)
        candidates = [x for x in normalized if x["Q"] >= q_cutoff]
        chosen = max(candidates, key=lambda x: x["S"])

    # 6. High quality + low cost
    elif preference == "quality_cost":
        chosen = max(normalized, key=lambda x: x["Q"] * x["C"])

    # 7. Fast + low cost
    elif preference == "latency_cost":
        chosen = max(normalized, key=lambda x: x["S"] * x["C"])

    else:
        raise ValueError(f"Unknown preference: {preference}")

    # ---------- ANTI-FLAPPING ----------

    if last_selected and last_score is not None:
        new_score = 0.4*chosen["Q"] + 0.3*(10*chosen["S"]) + 0.3*(10*chosen["C"])
        if abs(new_score - last_score) < ANTI_FLAP_DELTA:
            for x in normalized:
                if x["model"].name == last_selected:
                    return x["model"]

    return chosen["model"]

# ------------------ EXAMPLE ------------------

if __name__ == "__main__":
    now = time.time()

    models = [
        ModelMetrics("model_A", 9.6, 900, 1.2, now),
        ModelMetrics("model_B", 8.2, 650, 1.8, now),
        ModelMetrics("model_C", 7.5, 1100, 0.9, now),
        ModelMetrics("model_D", 9.0, 850, 1.1, now),
    ]

    selected = select_model(
        models=models,
        preference="balanced"
    )

    print("Selected model:", selected.name)
