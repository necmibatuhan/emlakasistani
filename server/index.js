require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const leadsRoutes = require('./routes/leads');
const statsRoutes = require('./routes/stats');
const propertiesRoutes = require('./routes/properties');
const integrationsRoutes = require('./routes/integrations');
const companiesRoutes = require('./routes/companies');
const officesRoutes = require('./routes/offices');
const voiceRoutes = require('./routes/voice');
const paymentRoutes = require('./routes/payment');
const calendarRoutes = require('./routes/calendar');
const dashboardRoutes = require('./routes/dashboard');
const templatesRoutes = require('./routes/templates');
const contactsRoutes = require('./routes/contacts');
const analyticsRoutes = require('./routes/analytics');
const notificationsRoutes = require('./routes/notifications');
const subscriptionRoutes = require('./routes/subscription');
const socialProofRoutes = require('./routes/socialProof');
const matchRoutes = require('./routes/match');
const onboardingRoutes = require('./routes/onboarding');
const whatsappRoutes = require('./routes/whatsapp');
require('./services/queue'); // Start background worker
require('./services/churnPrevention'); // Start cron job
require('./services/morningBriefing'); // Start daily briefing job

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5001;

// 1. Security Headers (Helmet)
app.use(helmet());
app.use(helmet.hidePoweredBy()); // Remove X-Powered-By
app.use(helmet.noSniff()); // Prevent MIME sniffing
app.use(helmet.xssFilter()); // Add XSS protection header
app.use(helmet.frameguard({ action: 'deny' })); // Prevent Clickjacking (no iframes allowed)

// 2. Strict CORS
const allowedOrigins = [
  'https://www.kapora.online',
  'https://kapora.online',
  'http://localhost:5173'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// 3. Rate Limiting (Anti-DDoS & Anti-Scraping)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  message: { message: "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin." },
  standardHeaders: true, 
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' })); // Limit body payload, increased to 10mb for image uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Twilio Webhooks için gerekli!

app.use('/v1/whatsapp-receiver', whatsappRoutes); // Twilio Inbound Webhook

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/offices', officesRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/social-proof', socialProofRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/onboarding', onboardingRoutes);

app.get('/', (req, res) => {
  res.send('Kapora API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
