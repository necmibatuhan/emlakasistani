require('dotenv').config();
const db = require('./db');

async function run() {
  try {
    const res = await db.query("UPDATE leads SET budget_min = '500' WHERE id = '00000000-0000-0000-0000-000000000000'");
    console.log(res);
  } catch(e) {
    console.error("DB ERROR2:", e.message);
  }
}
run();
