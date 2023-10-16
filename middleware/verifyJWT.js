const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  // check if token is in header
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if(!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'not authorised' });
  }

  // get token
  const token = authHeader.split(' ')[1];

  // evaluate token
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err, decoded) => {
      if(err) {
        return res.status(403).json({ message: 'forbidden' });
      }

      req.user = decoded.username;
      req.roles = decoded.UserInfo.roles;
      next();
    }
  );
};

module.exports = verifyJWT;