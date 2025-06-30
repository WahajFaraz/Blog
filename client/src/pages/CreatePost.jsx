import React, { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import Editor from '../components/Editor';
import "./CreatePost.css";
import { motion } from 'framer-motion';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('/posts', { title, content }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/');
    } catch (err) {
      alert('Post creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h1 className="form-title">Create New Post</h1>
      <motion.div
        className="createpost-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring', bounce: 0.3 }}
      >
        <span role="img" aria-label="sparkle" className="hero-emoji">✨</span>
        <div className="hero-content">
          <h2>Share your story with the world!</h2>
          <p>Use the editor below to craft a beautiful, engaging blog post. Format your text, add images or videos, and make your post stand out!</p>
        </div>
      </motion.div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter your post title..."
          required
          disabled={isSubmitting}
          className="title-input"
        />
        <Editor value={content} onChange={setContent} />
        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? (
            <>
              <div className="loading-spinner"></div> Publishing...
            </>
          ) : (
            'Publish Post'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;