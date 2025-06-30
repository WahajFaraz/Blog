import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEnvelope, FaCalendarAlt, FaEdit, FaSignOutAlt, FaTrash, FaMoon, FaSun, FaLock, FaImage, FaBook, FaCommentDots, FaHeart, FaCog, FaSave } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import { useNavigate, Link } from 'react-router-dom';
// import { useTheme } from '../components/ThemeContext';
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ username: '', bio: '', profilePic: null });
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // const { theme, toggleTheme } = useTheme();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await axios.get('/users/me', { headers: { Authorization: `Bearer ${token}` } });
      setUser(res.data);
      setEditData({ username: res.data.username, bio: res.data.bio, profilePic: null });
      const postsRes = await axios.get(`/posts?author=${res.data._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setPosts(postsRes.data);
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        alert('Failed to fetch profile. Please try again later.');
      }
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
    // document.body.className = theme;
  }, [fetchProfile]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('username', editData.username);
    formData.append('bio', editData.bio);
    if (editData.profilePic) formData.append('profilePic', editData.profilePic);
    try {
      await axios.put('/users/me', formData, { headers: { Authorization: `Bearer ${token}` } });
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const handlePasswordReset = async () => {
    if (!window.confirm("Send a password reset link to your email?")) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post('/users/me/reset-password', {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('Password reset email sent!');
    } catch (err) {
      alert('Failed to send password reset email');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    // localStorage.removeItem('theme');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete('/users/me', { headers: { Authorization: `Bearer ${token}` } });
      handleLogout();
    } catch (err) {
      alert('Failed to delete account');
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Delete this post?")) {
      const token = localStorage.getItem("token");
      await axios.delete(`/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    }
  };

  if (loading) return <div className="profile-container-loading">Loading...</div>;
  if (!user) return null;

  return (
    <div className="profile-container">
      <div className="card">
        <div className="profile-header">
          <div className="profile-pic-container">
            <img className="profile-pic" src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`} alt="Profile" />
          </div>
          <div className="profile-info">
            <h2 className="username">{user.username}</h2>
            <p className="bio">{user.bio || 'No bio yet. Click Edit Profile to add one!'}</p>
            <div className="info-row"><FaEnvelope /> <span>{user.email}</span></div>
            <div className="info-row"><FaCalendarAlt /> <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span></div>
          </div>
          <div className="header-actions">
             <button className="action-button" onClick={() => setEditMode(!editMode)}><FaEdit /> {editMode ? 'Cancel' : 'Edit Profile'}</button>
             <button className="action-button" onClick={handlePasswordReset}><FaLock /> Reset Password</button>
          </div>
        </div>
        <AnimatePresence>
        {editMode && (
          <motion.form 
            className="edit-form"
            onSubmit={handleEditSubmit} 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
          >
            <input className="input" name="username" value={editData.username} onChange={(e) => setEditData({...editData, username: e.target.value})} placeholder="Username" required />
            <textarea className="textarea" name="bio" value={editData.bio} onChange={(e) => setEditData({...editData, bio: e.target.value})} placeholder="Bio" maxLength={200} />
            <label className="file-input-label" htmlFor="profilePicUpload">
              <FaImage/> Change Profile Picture
            </label>
            <input className="input" id="profilePicUpload" name="profilePic" type="file" accept="image/*" onChange={(e) => setEditData({...editData, profilePic: e.target.files[0]})} style={{display: 'none'}} />
            <button className="action-button" type="submit"><FaSave /> Save Changes</button>
          </motion.form>
        )}
        </AnimatePresence>
      </div>

      <div className="card">
        <div className="tabs">
          <button className={`tab-button${tab === 'posts' ? ' active' : ''}`} onClick={() => setTab('posts')}><FaBook /> My Posts</button>
          <button className={`tab-button${tab === 'comments' ? ' active' : ''}`} onClick={() => setTab('comments')}><FaCommentDots /> My Comments</button>
          <button className={`tab-button${tab === 'likes' ? ' active' : ''}`} onClick={() => setTab('likes')}><FaHeart /> Liked Posts</button>
          <button className={`tab-button${tab === 'settings' ? ' active' : ''}`} onClick={() => setTab('settings')}><FaCog /> Settings</button>
        </div>
        <div className="tab-content">
          {tab === 'posts' && (
            <div className="post-list">
              {posts.map(post => (
                <motion.div key={post._id} className="post-item" whileHover={{ y: -5 }}>
                  <Link to={`/post/${post._id}`}>
                    <h4>{post.title}</h4>
                    <p>Created on: {new Date(post.createdAt).toLocaleDateString()}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
          {tab === 'comments' && <div>Comments section coming soon.</div>}
          {tab === 'likes' && <div>Liked posts section coming soon.</div>}
          {tab === 'settings' && (
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Account Settings</h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button className="danger-button" onClick={() => setShowDeleteModal(true)}><MdDeleteForever /> Delete Account</button>
                <span>This action is irreversible.</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="card">
        <h3>Settings</h3>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          {/* <div>
            <button className="action-button" onClick={toggleTheme}>
              {theme === 'light' ? <FaMoon /> : <FaSun />} Toggle Theme
            </button>
          </div> */}
          <div>
            <button className="action-button" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
            <button className="danger-button" onClick={() => setShowDeleteModal(true)} style={{marginLeft: '1rem'}}><FaTrash /> Delete Account</button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <h2 style={{ marginBottom: '1rem' }}>Are you sure?</h2>
              {/* <p style={{ marginBottom: '2rem', color: theme.subtext }}>This will permanently delete your account and all of your content.</p> */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button className="action-button" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="danger-button" onClick={handleDeleteAccount}>Yes, Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
