const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.post('/', protect, upload.single('media'), async (req, res) => {
  try {
    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      mediaUrl: req.file ? req.file.path : null,
      author: req.user._id
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create post' });
  }
});

router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.author) {
    filter.author = req.query.author;
  }
  const posts = await Post.find(filter).populate('author', 'username');
  res.json(posts);
});

router.get('/feed', protect, async (req, res) => {
  try {
    const posts = await Post.find({ author: { $ne: req.user._id } }).populate('author', 'username');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch feed' });
  }
});

router.get('/myposts', protect, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id }).populate('author', 'username');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your posts' });
  }
});

router.get('/:id', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'username');
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
});

router.put('/:id', protect, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to edit this post' });
  }

  post.title = req.body.title;
  post.content = req.body.content;
  await post.save();
  res.json(post);
});

// Delete Post
router.delete('/:id', protect, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this post' });
  }

  await Post.deleteOne({ _id: post._id });
  res.json({ message: 'Post deleted' });
});

module.exports = router;
