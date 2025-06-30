import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
import {jwtDecode} from "jwt-decode";
// import { useTheme } from '../components/ThemeContext';
import "./Home.css";
import PostCard from '../components/PostCard';
import { FaPencilAlt } from 'react-icons/fa';
import { FaChartLine } from 'react-icons/fa';
import { FaUsers } from 'react-icons/fa';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const navigate = useNavigate();
  // const { theme } = useTheme();

  // const gridVariants = {
  //   hidden: { opacity: 0 },
  //   visible: {
  //     opacity: 1,
  //     transition: {
  //       staggerChildren: 0.1
  //     }
  //   }
  // };

  // const cardVariants = {
  //   hidden: { opacity: 0, y: 50 },
  //   visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  //   exit: { opacity: 0, y: -30, transition: { duration: 0.3 } }
  // };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/posts/feed", { headers: { Authorization: `Bearer ${token}` } });
        setPosts(res.data);
        if (token) {
          try {
            const decoded = jwtDecode(token);
            setLoggedInUserId(decoded.id || decoded._id);
          } catch {}
        }
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (postId) => {
    if (window.confirm("Delete this post?")) {
      const token = localStorage.getItem("token");
      await axios.delete(`/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    }
  };

  return (
    <div className="home">
      <div className="hero-section">
        <div className="container">
          <div className="hero-content fade-in">
            <h1 className="hero-title">
              Welcome to <span className="gradient-text">BlogSpace</span>
            </h1>
            <p className="hero-subtitle">
              Discover amazing stories, insights, and knowledge from our community of writers
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">ARTICLES</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50k+</span>
                <span className="stat-label">READERS</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100+</span>
                <span className="stat-label">WRITERS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="blogs-section">
        <div className="container">
          <div className="section-header fade-in">
            <h2 className="section-title">Latest Articles</h2>
            <div className="section-divider-row">
              <div className="vertical-line" />
              <span className="section-bold-text">Stay updated with the latest trends and insights</span>
            </div>
          </div>
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
            style={{ marginBottom: 32, marginTop: 0 }}
          />
          {loading ? (
            <div className="loading-message">
              Loading posts...
            </div>
          ) : (
            <div className="blogs-grid grid grid-3">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    isAuthor={post.author && (post.author._id === loggedInUserId)}
                    onEdit={() => navigate(`/edit/${post._id}`)}
                    onDelete={() => handleDelete(post._id)}
                  />
                ))
              ) : (
                <div className="no-posts">No posts found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
