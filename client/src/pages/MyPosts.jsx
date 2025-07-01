import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PostCard from "../components/PostCard";
import "./MyPosts.css";

const TABS = [
  { key: "all", label: "All Posts" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "scheduled", label: "Scheduled" },
];

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
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

  const filteredPosts = posts.filter((post) => {
    const matchesTab =
      activeTab === "all" || (post.status && post.status.toLowerCase() === activeTab);
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      (post.tags && post.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())));
    return matchesTab && matchesSearch;
  });

  const getStatusCount = (status) => {
    if (status === "all") return posts.length;
    return posts.filter((post) => post.status && post.status.toLowerCase() === status).length;
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Delete this post?")) {
      const token = localStorage.getItem("token");
      await axios.delete(`/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    }
  };

  const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
  const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (Array.isArray(post.comments) ? post.comments.length : 0), 0);

  return (
    <div className="my-posts">
      <div className="container">
        <div className="my-posts-header fade-in">
          <h1 className="page-title">My Posts</h1>
          <p className="page-subtitle">Manage and track your published content</p>
        </div>

        <div className="posts-dashboard card scale-in">
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon stat-icon-posts">
                <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="32" height="32" rx="6" fill="#fff" stroke="#333" strokeWidth="2.5"/><path d="M16 20h16M16 28h16M16 36h10" stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
              <div className="stat-info-horizontal">
                <span className="stat-number">{posts.length}</span>
                <span className="stat-label">TOTAL POSTS</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-views">
                <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="24" cy="24" rx="18" ry="12" fill="#fff" stroke="#333" strokeWidth="2.5"/><ellipse cx="24" cy="24" rx="5" ry="5" fill="#333"/></svg>
              </div>
              <div className="stat-info-horizontal">
                <span className="stat-number">{totalViews}</span>
                <span className="stat-label">TOTAL VIEWS</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-likes">
                <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 42s-12-10-12-19A8.5 8.5 0 0 1 24 14a8.5 8.5 0 0 1 12 9c0 9-12 19-12 19Z" fill="#fff" stroke="#E53E3E" strokeWidth="2.5"/></svg>
              </div>
              <div className="stat-info-horizontal">
                <span className="stat-number">{totalLikes}</span>
                <span className="stat-label">TOTAL LIKES</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-comments">
                <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="12" width="32" height="22" rx="6" fill="#fff" stroke="#333" strokeWidth="2.5"/><path d="M16 34v6l6-6" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
              <div className="stat-info-horizontal">
                <span className="stat-number">{totalComments}</span>
                <span className="stat-label">TOTAL COMMENTS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="posts-controls card slide-in">
          <div className="posts-controls-row">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search your posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <div className="search-icon">🔍</div>
            </div>
            <div className="filter-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  className={`filter-tab ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                  <span className="tab-count">({getStatusCount(tab.key)})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-message">Loading your posts...</div>
        ) : (
          <>
            <div className="posts-grid">
              {filteredPosts.map((post, index) => (
                <div
                  key={post._id}
                  className="fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <PostCard
                    post={post}
                    isAuthor={post.author && (post.author._id === loggedInUserId)}
                    onEdit={() => navigate(`/edit/${post._id}`)}
                    onDelete={() => handleDelete(post._id)}
                  />
                </div>
              ))}
            </div>
            {filteredPosts.length === 0 && (
              <div className="empty-state fade-in">
                <div className="empty-icon">📝</div>
                <h3 className="empty-title">No posts found</h3>
                <p className="empty-description">
                  {search ?
                    "Try adjusting your search terms or filters." :
                    "Start writing your first post to see it here!"
                  }
                </p>
                <button className="btn btn-primary" onClick={() => navigate("/create")}>Create New Post</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyPosts; 