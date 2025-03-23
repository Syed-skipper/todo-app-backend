const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.header('access-token');
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        req.user = verified;
        next();
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: 'Invalid Token' });
    }
};

module.exports = authenticateToken;
