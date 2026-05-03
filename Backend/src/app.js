require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
require('./db');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*'}));
app.use(morgan('dev'));
app.use(express.json());

app.get('/check', (req, res) => {
    res.json({ status: 'ok'});
});
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` Server running on ${PORT}`);
});

module.exports = app;