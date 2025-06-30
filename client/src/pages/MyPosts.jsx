import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./MyPosts.css";

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/posts/myposts", { headers: { Authorization: `Bearer ${token}` } });
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

  const filteredPosts = posts
    .filter((post) =>
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
    <div className="home-container">
      <h2 className="page-header">My Posts</h2>
      <input
        type="text"
        placeholder="Search my posts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />
      {loading ? (
        <div className="loading-message">Loading your posts...</div>
      ) : (
        <div className="posts-grid">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post._id} className="post-card">
                {post.mediaUrl && (
                  <div className="media-thumb">
                    {post.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video src={post.mediaUrl} controls preload="metadata" />
                    ) : (
                      <img src={post.mediaUrl} alt="Post media" />
                    )}
                  </div>
                )}
                <div className="post-content">
                  <h3 className="post-title">
                    <Link to={`/post/${post._id}`}>{post.title}</Link>
                  </h3>
                  <p className="post-author">By {post.author.username}</p>
                  {post.author._id === loggedInUserId && (
                    <div className="post-actions">
                      <button className="edit-button" onClick={() => navigate(`/edit/${post._id}`)}>Edit</button>
                      <button className="delete-button" onClick={() => handleDelete(post._id)}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-posts">You haven't created any posts yet.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyPosts; 