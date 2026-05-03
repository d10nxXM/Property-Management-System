const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    //duplikat
    if(err.code === '23505') {
        return res.status(409).json({ error: 'Already exists'});
    }

    if(err.code === '23503') {
        return res.status(400).json({ error: 'Invalid reference'});

    }

    //token error
    if (err.name === 'JsonWebTokenError'){
        return res.status(401).json({ error: 'Invalid Token'});
    }

    if(err.name === 'TokenExpiredError'){
        return res.status(401).json({ error: 'Token Expired'});
    }

    res.status(err.status || 500).json({ error: err.message });
};

module.exports = errorHandler;