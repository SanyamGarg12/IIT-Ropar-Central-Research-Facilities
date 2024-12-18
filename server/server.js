const express = require('express');
const bodyParser = require('body-parser');
const membersRoutes = require('./routes/members');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

// Serve static assets (e.g., images)
app.use('/assets', express.static('assets'));

// Routes
app.use(membersRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
