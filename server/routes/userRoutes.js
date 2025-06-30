const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post('/signup', upload.single('profilePic'), async (req, res) => {
  const { username, email, password, bio } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      username,
      email,
      password,
      bio: bio || '',
      profilePic: req.file ? req.file.path : ''
    });

    await user.save();

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profilePic: user.profilePic
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ✅ FIXED: use user._id and user.username
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


router.post('/logout', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Token discarded successfully (client should remove token from storage)' 
  });
});

// Get current user info with stats
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const postsCount = await Post.countDocuments({ author: user._id });
    // TODO: Add comments/likes count if you have those models
    res.json({
      ...user.toObject(),
      stats: {
        posts: postsCount,
        comments: 0, // Placeholder
        likes: 0 // Placeholder
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user info' });
  }
});

// Edit profile (username, bio, profilePic)
router.put('/me', protect, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.body.username) user.username = req.body.username;
    if (req.body.bio) user.bio = req.body.bio;
    if (req.file) user.profilePic = req.file.path;
    user.updatedAt = Date.now();
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

router.post('/me/reset-password', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const msg = {
      to: user.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`
    };
    await sgMail.send(msg);
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send password reset email' });
  }
});

// Delete account
router.delete('/me', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    await Post.deleteMany({ author: req.user._id });
    // TODO: Delete comments, likes, etc. if you have those models
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

module.exports = router;