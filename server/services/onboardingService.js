const db = require('../db');

const getOnboardingProgress = async (userId) => {
  let progress = await db.query('SELECT * FROM user_onboarding_progress WHERE user_id = $1', [userId]);
  
  if (progress.rows.length === 0) {
    progress = await db.query(
      'INSERT INTO user_onboarding_progress (user_id) VALUES ($1) RETURNING *',
      [userId]
    );
  }
  return progress.rows[0];
};

const checkAndLevelUp = async (userId, currentProgress) => {
  let newLevel = currentProgress.current_level;

  if (currentProgress.has_added_3_leads && currentProgress.has_analyzed_listing && currentProgress.current_level < 2) {
    newLevel = 2; // Teknoloji Odaklı Danışman
  }
  if (newLevel >= 2 && currentProgress.has_first_match && currentProgress.current_level < 3) {
    newLevel = 3; // Eşleşme Avcısı
  }
  if (newLevel >= 3 && currentProgress.has_10_leads && currentProgress.current_level < 4) {
    newLevel = 4; // AI Satış Uzmanı
  }

  if (newLevel !== currentProgress.current_level) {
    await db.query('UPDATE user_onboarding_progress SET current_level = $1 WHERE user_id = $2', [newLevel, userId]);
  }
  return newLevel;
};

const triggerLeadAdded = async (userId) => {
  try {
    const leadCountRes = await db.query('SELECT COUNT(*) FROM leads WHERE assigned_to = $1', [userId]);
    const leadCount = parseInt(leadCountRes.rows[0].count);

    const progress = await getOnboardingProgress(userId);

    let updates = [];
    let queryParams = [];
    let paramIndex = 1;

    if (leadCount >= 3 && !progress.has_added_3_leads) {
      updates.push(`has_added_3_leads = $${paramIndex++}`);
      queryParams.push(true);
      progress.has_added_3_leads = true;
    }

    if (leadCount >= 10 && !progress.has_10_leads) {
      updates.push(`has_10_leads = $${paramIndex++}`);
      queryParams.push(true);
      progress.has_10_leads = true;
    }

    if (updates.length > 0) {
      queryParams.push(userId);
      await db.query(`UPDATE user_onboarding_progress SET ${updates.join(', ')} WHERE user_id = $${paramIndex}`, queryParams);
      await checkAndLevelUp(userId, progress);
    }
  } catch (err) {
    console.error("Error triggering lead added onboarding event:", err);
  }
};

const triggerListingAnalyzed = async (userId) => {
  try {
    const progress = await getOnboardingProgress(userId);
    if (!progress.has_analyzed_listing) {
      await db.query('UPDATE user_onboarding_progress SET has_analyzed_listing = true WHERE user_id = $1', [userId]);
      progress.has_analyzed_listing = true;
      await checkAndLevelUp(userId, progress);
    }
  } catch (err) {
    console.error("Error triggering listing analyzed onboarding event:", err);
  }
};

const triggerFirstMatch = async (userId) => {
  try {
    const progress = await getOnboardingProgress(userId);
    if (!progress.has_first_match) {
      await db.query('UPDATE user_onboarding_progress SET has_first_match = true WHERE user_id = $1', [userId]);
      progress.has_first_match = true;
      await checkAndLevelUp(userId, progress);
    }
  } catch (err) {
    console.error("Error triggering first match onboarding event:", err);
  }
};

module.exports = {
  getOnboardingProgress,
  triggerLeadAdded,
  triggerListingAnalyzed,
  triggerFirstMatch
};
