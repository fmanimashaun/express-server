const User = require('../models/User');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

handleLogin = async (req, res) => {
  const cookies = req.cookies;
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' });
  }

  // Check if username exists
  foundUser = await User.findOne({ username: username }).exec();

  if (!foundUser) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // evaluate password
  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  } else {
    const roles = Object.values(foundUser.roles).filter(Boolean);

    // create token
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '10s' },
    );

    const newRefreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '20s' },
    );

    const newRefreshTokenArray = !cookies?.jwt
      ? foundUser.refreshToken
      : foundUser.refreshToken.filter((token) => token !== cookies.jwt);

    // delete cookies
    if (cookies?.jwt) {
      res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: true,// remove secure: true for localhost testing with thunderclient
      }); 
    }

    // updaet and save refresh token to database
    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    const result = await foundUser.save();

    res.cookie('jwt', newRefreshToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: true, // remove secure: true for localhost testing with thunderclient
      maxAge: 24 * 60 * 60 * 1000,
    }); 
    res.status(200).json({ accessToken });
  }
};

module.exports = { handleLogin };
