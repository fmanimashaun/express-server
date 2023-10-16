const User = require('../models/User');

const jwt = require('jsonwebtoken');

handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  console.log('cookies', cookies);

  if (!cookies?.jwt) return res.status(401).json({ message: 'not authorised' });

  const refreshToken = cookies.jwt;

  // clear cookie
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'None',
    secure: true, // remove secure: true for localhost testing with thunderclient
  });

  // Check if username exists
  foundUser = await User.findOne({ refreshToken }).exec();

  // Detected refresh token in database
  if (!foundUser) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Forbidden' });
        }

        // Check if username exists
        const hackedUser = await User.findOne({
          username: decoded.username,
        }).exec();

        // Delete refresh token from user in database
        hackedUser.refreshToken = [];

        // save user
        const result = await hackedUser.save();
      },
    );
    return res.status(403).json({ message: 'Forbidden' });
  }

  // remove the received refresh token from the user's refresh token array
  const newRefreshTokenArray = foundUser.refreshToken.filter(
    (token) => token !== refreshToken,
  );

  // evaluate JWTs
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        foundUser.refreshToken = [...newRefreshTokenArray];

        // save user
        const result = await foundUser.save();
      }
      if (err || foundUser.username !== decoded.username) {
        return res.status(403).json({ message: 'Forbidden' });
      } else {
        const roles = Object.values(foundUser.roles).filter(Boolean);
        // create token
        const accessToken = jwt.sign(
          {
            UserInfo: {
              username: decoded.username,
              roles: roles,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '10s' },
        );

        const newRefreshToken = jwt.sign(
          { username: foundUser.username },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '1h' },
        );

        // updaet and save refresh token to database
        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        const result = await foundUser.save();

        // set cookie
        res.cookie('jwt', newRefreshToken, {
          httpOnly: true,
          sameSite: 'None',
          secure: true, // remove secure: true for localhost testing with thunderclient
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ accessToken });
      }
    },
  );
};

module.exports = { handleRefreshToken };
