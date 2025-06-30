import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '../components/Editor';
import {jwtDecode} from 'jwt-decode';
// import { useTheme } from '../components/ThemeContext';
import { motion } from 'framer-motion';
import "./EditPost.css";

const EditPost = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  // const { theme } = useTheme();
  let loggedInUserId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      loggedInUserId = decoded.id || decoded._id;
    } catch {}
  }

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/posts/${id}`);
        setTitle(res.data.title);
        setContent(res.data.content);
        if (res.data.author && res.data.author == loggedInUserId) {
          alert("You are not authorized to edit this post.");
          navigate('/');
          return;
        }
      } catch (err) {
        alert('Failed to load post');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await axios.put(`/posts/${id}`, { title, content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/post/${id}`);
    } catch (err) {
      alert('Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    navigate(`/post/${id}`);
  };

  const formVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  if (isLoading) {
    return (
      <div className="form-container">
        <h1 className="form-title">Loading Post...</h1>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h1 className="form-title">Edit Post</h1>
      <form onSubmit={handleUpdate}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter post title..."
          required
          disabled={isUpdating}
          className="title-input"
        />
       {/* <Editor value={content} onChange={setContent} theme={theme} /> */}
        <div className="action-buttons">
          <button type="button" onClick={handleCancel} disabled={isUpdating} className="secondary-button">
            Cancel
          </button>
          <button type="submit" disabled={isUpdating} className="primary-button">
            {isUpdating ? (
              <>
                <div className="loading-spinner"></div> Updating...
              </>
            ) : (
              'Update Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;