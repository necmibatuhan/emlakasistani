const numberFromEnv = (name, fallback) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
};

module.exports = {
  enabled: process.env.PREDICTIVE_SCORING_ENABLED !== 'false',
  modelVersion: process.env.PREDICTIVE_SCORING_MODEL_VERSION || 'weighted-logistic-v1',
  minimumOutcomes: numberFromEnv('PREDICTIVE_SCORING_MIN_OUTCOMES', 20),
  minimumConversions: numberFromEnv('PREDICTIVE_SCORING_MIN_CONVERSIONS', 5),
  weights: {
    intercept: numberFromEnv('PREDICTIVE_WEIGHT_INTERCEPT', -1.4),
    crmScore: numberFromEnv('PREDICTIVE_WEIGHT_CRM_SCORE', 1.15),
    contactFrequency: numberFromEnv('PREDICTIVE_WEIGHT_CONTACT_FREQUENCY', 0.8),
    responseSpeed: numberFromEnv('PREDICTIVE_WEIGHT_RESPONSE_SPEED', 0.65),
    matchStrength: numberFromEnv('PREDICTIVE_WEIGHT_MATCH_STRENGTH', 0.55),
    recency: numberFromEnv('PREDICTIVE_WEIGHT_RECENCY', 0.75),
  }
};
