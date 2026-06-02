require('dotenv').config();
const jwt = require('jsonwebtoken');

async function run() {
  const token = jwt.sign({ id: 'some-user-id', role: 'agent', company_id: 1, office_id: 1 }, process.env.JWT_SECRET || 'secret123');
  
  try {
    const res = await fetch('http://localhost:5001/api/voice/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        leadId: '8a0cdf33-2926-4fc5-8db9-af199f8ab6f0',
        transcript: "Merhaba Ahmet Bey, Kadıköy'deki ofisimizden arıyorum. Düşündüğünüz 3+1 daire için fiyatta anlaşabiliriz, yarın ofiste görüşelim."
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
