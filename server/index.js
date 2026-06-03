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
require('./services/queue'); // Start background worker

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/offices', officesRoutes);
app.use('/api/voice', voiceRoutes);

app.get('/', (req, res) => {
  res.send('Kapora API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
