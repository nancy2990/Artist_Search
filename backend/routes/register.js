const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const User = require('../models/User');

router.post('/', async (req, res) => {
  try {
    console.log("Backend here!");
    const { fullname, email, password } = req.body;

    // Basic validation (all fields required)
    if (!fullname || !email || !password) {
      return res.status(400).json({
        errors: { general: 'All fields are required.' },
      });
    }

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        errors: { email: 'User with this email already exists.' },
      });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a Gravatar URL
    const hash = crypto
      .createHash('sha256')
      .update(email.trim().toLowerCase())
      .digest('hex');
    const profileImageUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`;
    console.log(profileImageUrl);

    // Create a new user document
    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
      profileImageUrl,
    });
    await newUser.save();

    // Create a JWT token valid for 1 hour
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || 'someSecretKey',
      { expiresIn: '1h' }
    );

    // Set the token as an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // Return a success response
    return res.status(201).json({
      message: 'User created successfully.',
      fullname: newUser.fullname,
      profileImageUrl: newUser.profileImageUrl,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      errors: { general: 'Internal server error.' },
    });
  }
});

module.exports = router;
