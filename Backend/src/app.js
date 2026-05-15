require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
require('./db');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*'}));
app.use(morgan('dev'));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// rute
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/workers', require('./routes/workers.routes'));
app.use('/api/properties', require('./routes/properties.routes'));
app.use('/api/repair-requests', require('./routes/repairs.routes'));
app.use('/api/reviews',  require('./routes/reviews.routes'));
app.use('/api/search', require('./routes/search.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api', require('./routes/lookup.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

app.get('/check', (req, res) => {
    res.json({ status: 'ok'});
});
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` Server running on ${PORT}`);
});

module.exports = app;