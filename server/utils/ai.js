const { GoogleGenerativeAI } = require('@google/generative-ai');

let keyIndex = 0;

const getGenAI = () => {
  const keys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(k => k && k !== 'mock');
  if (keys.length === 0) {
    return new GoogleGenerativeAI('mock');
  }
  const key = keys[keyIndex % keys.length];
  keyIndex++;
  return new GoogleGenerativeAI(key);
};

const hasValidAiConfig = () => {
  const keys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(k => k && k !== 'mock');
  return keys.length > 0;
};

module.exports = { getGenAI, hasValidAiConfig };
