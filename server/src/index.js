require('dotenv').config();
const express = require('express');
const cors = require('cors');
const resumeRoutes = require('./routes/resume');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', resumeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
