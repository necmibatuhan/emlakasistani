const express = require('express');
const db = require('../db');

const router = express.Router();

// Mock HubSpot Webhook
router.post('/hubspot/webhook', async (req, res) => {
  console.log('Received HubSpot Webhook:', req.body);
  res.status(200).send('OK');
});

// Mock Zoho Webhook
router.post('/zoho/webhook', async (req, res) => {
  console.log('Received Zoho Webhook:', req.body);
  res.status(200).send('OK');
});

// GET WhatsApp Status
router.get('/whatsapp/status', async (req, res) => {
  // In a real app, query crm_integrations table for provider 'whatsapp'
  res.json({
    connected: true,
    phone_number: '+90 5XX XXX XX XX',
    last_sync: new Date().toISOString()
  });
});

// POST WhatsApp Connect
router.post('/whatsapp/connect', async (req, res) => {
  // In a real app, save tokens to crm_integrations
  res.json({ success: true, message: 'WhatsApp başarıyla bağlandı.' });
});

// GET WhatsApp Messages
router.get('/whatsapp/messages', async (req, res) => {
  res.json([
    { id: 1, from: '+90 532 000 0000', text: "Kadıköy'de 3+1 arıyorum", date: new Date().toISOString(), status: 'Sıcak' },
    { id: 2, from: '+90 505 000 0000', text: "Fiyatlar nasıl acaba?", date: new Date(Date.now() - 86400000).toISOString(), status: 'Soğuk' },
    { id: 3, from: '+90 544 000 0000', text: "Görüşebilir miyiz?", date: new Date(Date.now() - 172800000).toISOString(), status: 'Ilık' }
  ]);
});

// POST WhatsApp Send
router.post('/whatsapp/send', async (req, res) => {
  // Mock sending message
  console.log('Sending message to', req.body.to, ':', req.body.text);
  res.json({ success: true });
});

// Mock WhatsApp Inbound Webhook
router.post('/whatsapp/webhook', async (req, res) => {
  try {
    const { entry } = req.body;
    if (entry && entry[0] && entry[0].changes && entry[0].changes[0].value.messages) {
      const msg = entry[0].changes[0].value.messages[0];
      console.log(`WhatsApp message from ${msg.from}: ${msg.text.body}`);
      
      // In a real scenario, we would create a lead or add a note here.
      // queue.add('PROCESS_WHATSAPP_MESSAGE', { from: msg.from, text: msg.text.body });
    }
    res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Meta requires a GET request for Webhook Verification
router.get('/whatsapp/webhook', (req, res) => {
  const verify_token = process.env.WHATSAPP_VERIFY_TOKEN || 'test_token';
  
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === verify_token) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

module.exports = router;
