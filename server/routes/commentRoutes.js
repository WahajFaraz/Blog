const router = require("express").Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/admin");

router
    .route("/:postId")
    .post(protect, async (req, res) => {
        try {
            const post = await Post.findById(req.params.postId);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            const newComment = new Comment({
                text: req.body.text,
                user: req.user.id,
                post: req.params.postId,
            });
            const savedComment = await newComment.save();
            post.comments.push(savedComment._id);
            await post.save();
            res.status(201).json(savedComment);
        } catch (err) {
            res.status(500).json(err);
        }
    })
    .get(async (req, res) => {
        try {
            const post = await Post.findById(req.params.postId).populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username profilePic'
                }
            });
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            res.status(200).json(post.comments);
        } catch (err) {
            res.status(500).json(err);
        }
    });

// Delete a comment
router.delete("/:commentId", protect, admin, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        const post = await Post.findById(comment.post);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        post.comments.pull(comment._id);
        await post.save();
        await comment.remove();
        res.status(200).json({ message: "Comment has been deleted" });
    } catch (err) {
        res.status(500).json(err);
    }
});


module.exports = router; 