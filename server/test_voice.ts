require('dotenv').config();
const jwt = require('jsonwebtoken');

async function run() {
  const token = jwt.sign({ id: 1, role: 'agent', company_id: 1, office_id: 1 }, process.env.JWT_SECRET || 'secret123');
  
  try {
    const res = await fetch('http://localhost:5001/api/voice/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        leadId: 1,
        transcript: "Merhaba Ahmet Bey"
      })
    });
    const data = await res.json();
    console.log("ANALYZE STATUS:", res.status);
    console.log("ANALYZE SUCCESS:", data);
  } catch(e) {
    console.error("ANALYZE ERROR:", e);
  }
}
run();
