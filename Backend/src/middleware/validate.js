const { validationResult } = require('express-validator');

const validte = (req, res, next) => {
    const errprs = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()});
    }
    next();
};

module.exports = validate; 