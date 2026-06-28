require('dotenv').config();
const db = require('./db');

async function run() {
  try {
    const res = await db.query("INSERT INTO lead_notes (lead_id, content, note_type) VALUES ('00000000-0000-0000-0000-000000000000', 'test', 'voice')");
    console.log(res);
  } catch(e) {
    console.error("DB ERROR1:", e.message);
  }
}
run();
