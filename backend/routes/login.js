const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        errors: { general: 'Password or email is incorrect.' }
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        errors: { general: 'Password or email is incorrect.' }
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'someSecretKey',
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000 
    });

    return res.status(200).json({
      message: 'Logged in successfully.',
      fullname: user.fullname,
      profileImageUrl: user.profileImageUrl,
      token  
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      errors: { general: 'Internal server error.' }
    });
  }
});

module.exports = router;
