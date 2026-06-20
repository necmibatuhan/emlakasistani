// Mock Queue Service (In-memory) for development without Redis
const db = require('../db');
const { getGenAI, hasValidAiConfig } = require('../utils/ai');
const genAI = getGenAI();

const matchQueue = [];

// Worker process to handle matches in background
setInterval(async () => {
  if (matchQueue.length > 0) {
    const job = matchQueue.shift();
    if (job.name === 'MATCH_PROPERTIES') {
      try {
        console.log(`Processing MATCH_PROPERTIES for Lead: ${job.data.leadId}`);
        const leadRes = await db.query('SELECT * FROM leads WHERE id = $1', [job.data.leadId]);
        if (leadRes.rows.length === 0) return;
        const lead = leadRes.rows[0];

        let propsObj = {};
        if (typeof lead.properties === 'string') {
          try { propsObj = JSON.parse(lead.properties); } catch(e){}
        } else {
          propsObj = lead.properties || {};
        }

        // 1. Type Casting & Normalization
        let maxBudget = null;
        if (propsObj.budget) {
          if (typeof propsObj.budget === 'object' && propsObj.budget.max) {
             maxBudget = Number(String(propsObj.budget.max).replace(/\D/g, ''));
          } else if (typeof propsObj.budget === 'string' || typeof propsObj.budget === 'number') {
             maxBudget = Number(String(propsObj.budget).replace(/\D/g, ''));
          }
        }

        let requiredType = null;
        const intent = String(propsObj.customer_intent || propsObj.intent || '').toLowerCase();
        if (intent.includes('alıcı') || intent.includes('satici') || intent.includes('sat') || intent.includes('buyer')) requiredType = 'Satılık';
        if (intent.includes('kira') || intent.includes('renter')) requiredType = 'Kiralık';

        let locationQuery = null;
        let locations = propsObj.location_preferences || propsObj.locations || [];
        if (Array.isArray(locations) && locations.length > 0) {
           locationQuery = `%${locations[0].trim()}%`;
        } else if (typeof locations === 'string' && locations.trim()) {
           locationQuery = `%${locations.trim()}%`;
        }

        let rooms = null;
        let r = propsObj.rooms || propsObj.room_preference || propsObj.property_type;
        if (Array.isArray(r) && r.length > 0) rooms = String(r[0]);
        else if (typeof r === 'string') rooms = r;

        // Build SQL Query dynamically
        let query = "SELECT id, title, price, district, rooms FROM properties WHERE office_id = $1";
        let values = [lead.office_id];
        let idx = 2;

        if (maxBudget && maxBudget > 0) {
            query += ` AND price <= $${idx}`;
            values.push(maxBudget);
            idx++;
        }

        if (requiredType) {
            query += ` AND type = $${idx}`;
            values.push(requiredType);
            idx++;
        }

        if (locationQuery && locationQuery !== '%%') {
            query += ` AND (district ILIKE $${idx} OR city ILIKE $${idx})`;
            values.push(locationQuery);
            idx++;
        }

        if (rooms && rooms.includes('+')) {
            query += ` AND rooms ILIKE $${idx}`;
            values.push(`%${rooms}%`);
            idx++;
        }

        query += " ORDER BY created_at DESC LIMIT 3";

        const matchedProps = await db.query(query, values);

        for (const match of matchedProps.rows) {
            // Calculate a score out of 100
            let score = 95;
            await db.query(
                'INSERT INTO lead_property_matches (lead_id, property_id, match_score, ai_reasoning) VALUES ($1, $2, $3, $4)',
                [lead.id, match.id, score, `Sistem Eşleşmesi: Bütçeye uygun (${match.price} ₺), Lokasyon: ${match.district}, Oda: ${match.rooms}`]
            );
        }
        console.log(`Matched ${matchedProps.rows.length} properties for lead ${lead.id} via SQL.`);

      } catch (err) {
        console.error("Queue matching error:", err);
      }
    }
  }
}, 3000);

const queue = {
  add: (name, data) => {
    matchQueue.push({ name, data });
  }
};

module.exports = queue;
