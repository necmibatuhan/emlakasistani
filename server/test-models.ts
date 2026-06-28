require('dotenv').config();
const { getGenAI } = require('./utils/ai');
const fs = require('fs');

async function test() {
  const genAI = getGenAI();
  try {
     const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY_2}`);
     const data = await result.json();
     console.log(data.models.filter(m => m.name.includes('flash')).map(m => m.name));
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
test();
