const requireRole = (...roles) => (req, res, next) => {
    if(!req.user){
        return res.status(401).json({error: 'Not authenticated' });

    }

    if(!roles.includes(req.user.role)) {
        let resp = res.status(403);
        resp.json({ error: "You do not have permission"});
        return resp;
    }

    next();
};


module.exports = requireRole;