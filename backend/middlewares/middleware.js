const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

function authMiddleware(req, res, next) {
    const auth = req.headers.authorization
    if(!auth || !auth.startsWith("Bearer")) {
        res.status(403).json({msg: 'Unauthorized/Forbidden'})
        return
    }

    try {
        const token = auth.split(' ')[1]
        const { userId } = jwt.verify(token, JWT_SECRET)
        req.userId = userId
        next()
    } catch(e) {
        res.status(403).json({msg: 'Unauthorized/Forbidden'})
    }
}

module.exports = {
    authMiddleware
}