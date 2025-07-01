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
  const [editData, setEditData] = useState({ username: '', bio: '', location: '', profiles: [{ label: '', url: '' }], profilePic: null });
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
      setEditData({ username: res.data.username, bio: res.data.bio, location: res.data.location, profiles: res.data.profiles.map(p => ({ label: p.label, url: p.url })), profilePic: null });
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

  const handleProfileChange = (idx, field, value) => {
    setEditData(prev => {
      const updated = [...prev.profiles];
      updated[idx][field] = value;
      return { ...prev, profiles: updated };
    });
  };

  const addProfileField = () => {
    setEditData(prev => ({ ...prev, profiles: [...prev.profiles, { label: '', url: '' }] }));
  };

  const removeProfileField = (idx) => {
    setEditData(prev => ({ ...prev, profiles: prev.profiles.filter((_, i) => i !== idx) }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('username', editData.username);
    formData.append('bio', editData.bio);
    formData.append('location', editData.location || '');
    formData.append('profiles', JSON.stringify(Array.isArray(editData.profiles) ? editData.profiles.filter(p => p.label && p.url) : []));
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
    <div className="profile">
      <div className="container">
        <div className="profile-header fade-in">
          <div className="profile-banner">
            <div className="banner-overlay"></div>
          </div>
          <div className="profile-info-section">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                <img src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`} alt={user.username} />
                <button className="avatar-edit-btn" onClick={() => setEditMode(!editMode)}>📷</button>
              </div>
              <div className="profile-basic-info">
                <h1 className="profile-name">{user.username}</h1>
                <p className="profile-email">{user.email}</p>
                <p className="profile-join-date">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="profile-actions">
              <button className="btn btn-primary" onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
              <button className="btn btn-outline" onClick={handlePasswordReset}>
                Reset Password
              </button>
            </div>
          </div>
        </div>
        <div className="profile-stats card scale-in">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{posts.length}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">0</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">0</span>
              <span className="stat-label">Following</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">0</span>
              <span className="stat-label">Likes</span>
            </div>
          </div>
        </div>
        <div className="profile-content">
          <div className="profile-tabs card slide-in">
            {[
              { key: 'overview', label: 'Overview', icon: '👤' },
              { key: 'settings', label: 'Settings', icon: '⚙️' },
              { key: 'achievements', label: 'Achievements', icon: '🏆' },
              { key: 'activity', label: 'Activity', icon: '📊' }
            ].map(tabItem => (
              <button
                key={tabItem.key}
                className={`profile-tab ${tab === tabItem.key ? 'active' : ''}`}
                onClick={() => setTab(tabItem.key)}
              >
                <span className="tab-icon">{tabItem.icon}</span>
                {tabItem.label}
              </button>
            ))}
          </div>
          <div className="profile-tab-content card fade-in">
            {tab === 'overview' && (
              <div className="overview-content">
                <div className="bio-section">
                  <h3 className="section-title">About Me</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                    <img src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`} alt={user.username} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                    <div>
                      <p className="profile-bio"><strong>Bio:</strong> {user.bio || <span style={{color:'#aaa'}}>No bio provided.</span>}</p>
                      <p className="profile-location"><strong>Location:</strong> {user.location || <span style={{color:'#aaa'}}>No location provided.</span>}</p>
                    </div>
                  </div>
                  <div className="profile-links">
                    <strong>Profile/Portfolio Links:</strong>
                    {user.profiles && user.profiles.length > 0 && user.profiles.some(p => p.label && p.url) ? (
                      <ul style={{ marginTop: 8 }}>
                        {user.profiles.filter(p => p.label && p.url).map((profile, idx) => (
                          <li key={idx} style={{ marginBottom: 4 }}>
                            <span style={{ fontWeight: 500 }}>{profile.label}:</span> <a href={profile.url} target="_blank" rel="noopener noreferrer">{profile.url}</a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span style={{color:'#aaa', marginLeft: 8}}>No links provided.</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            {tab === 'achievements' && (
              <div className="achievements-content">
                <h3 className="section-title">Achievements</h3>
                <div className="achievements-grid">
                  <div className="achievement-card">
                    <div className="achievement-icon">🏆</div>
                    <div className="achievement-info">
                      <h4 className="achievement-title">Top Writer</h4>
                      <p className="achievement-description">Reached 1000+ views on a single post</p>
                    </div>
                  </div>
                  <div className="achievement-card">
                    <div className="achievement-icon">🔥</div>
                    <div className="achievement-info">
                      <h4 className="achievement-title">Streak Master</h4>
                      <p className="achievement-description">Posted consistently for 30 days</p>
                    </div>
                  </div>
                  <div className="achievement-card">
                    <div className="achievement-icon">❤️</div>
                    <div className="achievement-info">
                      <h4 className="achievement-title">Community Favorite</h4>
                      <p className="achievement-description">Received 100+ likes on posts</p>
                    </div>
                  </div>
                  <div className="achievement-card">
                    <div className="achievement-icon">💎</div>
                    <div className="achievement-info">
                      <h4 className="achievement-title">Quality Content</h4>
                      <p className="achievement-description">Maintained high engagement rate</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {tab === 'settings' && (
              <div className="settings-content">
                <h3 className="section-title">Account Settings</h3>
                <div className="settings-grid">
                  <div className="setting-group">
                    <h4 className="setting-title">Email Notifications</h4>
                    <div className="setting-options">
                      <label className="setting-option">
                        <input type="checkbox" defaultChecked />
                        <span>New followers</span>
                      </label>
                      <label className="setting-option">
                        <input type="checkbox" defaultChecked />
                        <span>Comments on posts</span>
                      </label>
                      <label className="setting-option">
                        <input type="checkbox" />
                        <span>Weekly digest</span>
                      </label>
                    </div>
                  </div>
                  <div className="setting-group">
                    <h4 className="setting-title">Privacy</h4>
                    <div className="setting-options">
                      <label className="setting-option">
                        <input type="checkbox" defaultChecked />
                        <span>Make profile public</span>
                      </label>
                      <label className="setting-option">
                        <input type="checkbox" />
                        <span>Show email to followers</span>
                      </label>
                    </div>
                  </div>
                  <div className="setting-group">
                    <button className="danger-button" onClick={() => setShowDeleteModal(true)}><MdDeleteForever /> Delete Account</button>
                    <span>This action is irreversible.</span>
                  </div>
                  <div className="setting-group">
                    <button className="btn btn-outline" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
                  </div>
                </div>
              </div>
            )}
            {tab === 'activity' && (
              <div className="activity-content">
                <h3 className="section-title">Recent Activity</h3>
                <div className="activity-list">
                  {posts.map(post => (
                    <div className="activity-item" key={post._id}>
                      <div className="activity-icon">📝</div>
                      <div className="activity-details">
                        <p className="activity-text">Published a new post: "{post.title}"</p>
                        <span className="activity-time">{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {editMode && (
              <form className="edit-form" onSubmit={handleEditSubmit} style={{ marginTop: 24 }}>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    value={editData.bio}
                    onChange={e => setEditData({ ...editData, bio: e.target.value })}
                    className="form-input form-textarea"
                    rows={4}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setEditData({ ...editData, profilePic: e.target.files[0] })}
                    className="form-input"
                  />
                  {editData.profilePic ? (
                    <img src={URL.createObjectURL(editData.profilePic)} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', marginTop: 8, borderRadius: 8 }} />
                  ) : user.profilePic && (
                    <img src={user.profilePic} alt="Current" style={{ width: 80, height: 80, objectFit: 'cover', marginTop: 8, borderRadius: 8 }} />
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    value={editData.location}
                    onChange={e => setEditData({ ...editData, location: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Profile/Portfolio Links</label>
                  {editData.profiles.map((profile, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input
                        type="text"
                        placeholder="Label (e.g. LinkedIn)"
                        value={profile.label}
                        onChange={e => handleProfileChange(idx, 'label', e.target.value)}
                        className="form-input"
                        style={{ flex: 1 }}
                      />
                      <input
                        type="url"
                        placeholder="URL"
                        value={profile.url}
                        onChange={e => handleProfileChange(idx, 'url', e.target.value)}
                        className="form-input"
                        style={{ flex: 2 }}
                      />
                      {editData.profiles.length > 1 && (
                        <button type="button" onClick={() => removeProfileField(idx)} style={{ background: 'none', border: 'none', color: 'red', fontWeight: 'bold' }}>✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addProfileField} className="auth-btn" style={{ marginTop: 4 }}>+ Add Link</button>
                </div>
                <button type="submit" className="btn btn-primary"><FaSave /> Save Changes</button>
              </form>
            )}
          </div>
        </div>
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 style={{ marginBottom: '1rem' }}>Are you sure?</h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="danger-button" onClick={handleDeleteAccount}>Yes, Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
