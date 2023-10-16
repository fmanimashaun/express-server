const User = require('../models/User');

const bcrypt = require('bcrypt');

const handleRegister = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' });
  }

  // Check if username already exists

  const duplicateUser = await User.findOne({ username: username }).exec();

  if (duplicateUser) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  try {
    // encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create and store user to database
    const result = await User.create({
      "username": username,
      "password": hashedPassword,
    });

    console.log(result);

    return res.status(201).json({ message: 'User created' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { handleRegister };
