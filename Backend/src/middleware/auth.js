const jwt = require('jsonwebtoken');
const db = require('../db');
const asyncHandler = require('./asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({ error: 'No token'});
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { rows } =await db.query(
        `SELECT u.id, u.email, u.first_name, u.last_name r.name AS role 
        FROM users u 
        JOIN roles r on u.role_od = r.id 
        WHERE u.id = $1`,
        [decoded.userID]
    );

    if(!rows.length){
        return res.status(401).json({ error: 'User not found'});
    }

    req.user = rows[0];
    next();

});

modules.exports = authenticate;