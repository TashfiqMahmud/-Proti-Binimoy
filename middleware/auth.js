const jwt = require('jsonwebtoken');

const extractToken = (req) => {
    const authHeader = req.header('authorization');
    if (typeof authHeader === 'string' && authHeader.trim().length > 0) {
        const [scheme, token] = authHeader.trim().split(/\s+/);
        if (/^Bearer$/i.test(scheme) && token) {
            return token;
        }
    }

    const legacyToken = req.header('x-auth-token');
    if (typeof legacyToken === 'string' && legacyToken.trim().length > 0) {
        return legacyToken.trim();
    }

    return null;
};

module.exports = function(req, res, next) {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
