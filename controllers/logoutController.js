const User = require('../models/User');

handleLogout = async (req, res) => {

  // on client side, delete access token
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(204);

  const refreshToken = cookies.jwt;

  // Check if username exists
  foundUser = await User.findOne({ refreshToken }).exec();

  if (!foundUser) {
    // clear cookie
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: "None",
      secure: true  // remove secure: true for localhost testing with thunderclient
    });

    return res.status(204)
  }

  // Delete refresh token from user in database
  foundUser.refreshToken = foundUser.refreshToken.filter(token => token !== refreshToken);;
  const result = await foundUser.save();
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: true, // remove secure: true for localhost testing with thunderclient
    sameSite: "None"
  }); 
  res.sendStatus(204);
};

module.exports = { handleLogout };
