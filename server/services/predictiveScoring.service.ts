const db = require('../db');
const config = require('../config/predictiveScoring.config');

class PredictiveScoringAdapter {
  async predict(_features) { throw new Error('predict() must be implemented by an adapter'); }
}

class WeightedLogisticAdapter extends PredictiveScoringAdapter {
  async predict(features) {
    const clamp01 = value => Math.max(0, Math.min(1, Number(value) || 0));
    const normalized = {
      crmScore: clamp01(Number(features.current_crm_score || 0) / 10),
      contactFrequency: clamp01(Number(features.contacts_per_week || 0) / 5),
      responseSpeed: Number(features.contact_count || 0) > 0 ? clamp01(1 - Number(features.response_time_hours || 0) / (24 * 7)) : 0,
      matchStrength: clamp01((Number(features.match_count || 0) / 5) * 0.6 + (Number(features.average_match_score || 0) / 100) * 0.4),
      recency: clamp01(1 - Number(features.days_since_last_activity || 0) / 30),
    };
    const w = config.weights;
    const logit = w.intercept + w.crmScore * normalized.crmScore + w.contactFrequency * normalized.contactFrequency
      + w.responseSpeed * normalized.responseSpeed + w.matchStrength * normalized.matchStrength + w.recency * normalized.recency;
    const probability = 1 / (1 + Math.exp(-logit));
    return { score: Math.round(probability * 100), modelVersion: config.modelVersion, normalizedFeatures: normalized };
  }
}

let adapter = new WeightedLogisticAdapter();
const setPredictiveScoringAdapter = nextAdapter => { adapter = nextAdapter; };

async function getDataSufficiency(companyId) {
  const result = await db.query(`SELECT COUNT(*)::INTEGER AS outcomes,
    COUNT(*) FILTER (WHERE converted=TRUE)::INTEGER AS conversions
    FROM lead_conversion_features WHERE company_id=$1 AND converted IS NOT NULL`, [companyId]);
  const counts = result.rows[0];
  return { ...counts, sufficient: config.enabled && counts.outcomes >= config.minimumOutcomes && counts.conversions >= config.minimumConversions,
    required_outcomes: config.minimumOutcomes, required_conversions: config.minimumConversions };
}

async function predictLead(features) {
  const sufficiency = await getDataSufficiency(features.company_id);
  if (!sufficiency.sufficient) return { score: null, status: 'insufficient_data', sufficiency };
  const prediction = await adapter.predict(features);
  return { ...prediction, status: 'ready', sufficiency };
}

async function recalculateAllPredictions() {
  const features = await db.query("SELECT * FROM lead_conversion_features WHERE converted IS NULL");
  let updated = 0;
  let insufficient = 0;
  const sufficiencyCache = new Map();
  for (const lead of features.rows) {
    let sufficiency = sufficiencyCache.get(lead.company_id);
    if (!sufficiency) { sufficiency = await getDataSufficiency(lead.company_id); sufficiencyCache.set(lead.company_id, sufficiency); }
    if (!sufficiency.sufficient) {
      await db.query('UPDATE leads SET predicted_conversion_score=NULL,predicted_conversion_at=NOW(),predictive_model_version=$1 WHERE id=$2', [config.modelVersion, lead.lead_id]);
      insufficient++;
      continue;
    }
    const prediction = await adapter.predict(lead);
    await db.withTransaction(async client => {
      await client.query('UPDATE leads SET predicted_conversion_score=$1,predicted_conversion_at=NOW(),predictive_model_version=$2 WHERE id=$3', [prediction.score, prediction.modelVersion, lead.lead_id]);
      await client.query(`INSERT INTO lead_prediction_history(lead_id,predicted_score,model_version,feature_snapshot)
        VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [lead.lead_id, prediction.score, prediction.modelVersion, { ...lead, normalized: prediction.normalizedFeatures }]);
    });
    updated++;
  }
  return { updated, insufficient, model_version: config.modelVersion };
}

module.exports = { PredictiveScoringAdapter, WeightedLogisticAdapter, setPredictiveScoringAdapter, getDataSufficiency, predictLead, recalculateAllPredictions };
