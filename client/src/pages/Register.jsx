import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    bio: '',
    profilePic: null,
    profilePicPreview: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        profilePic: file,
        profilePicPreview: file ? URL.createObjectURL(file) : null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('bio', formData.bio);
      if (formData.profilePic) data.append('profilePic', formData.profilePic);
      await axios.post('/users/signup', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card fade-in">
          <div className="auth-header">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Sign up to start your journey</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Full Name</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your Full Name"
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Create a Strong password"
                required
                disabled={isLoading}
              />
            </div>
            <div className="terms-group">
              <input type="checkbox" id="terms" required disabled={isLoading} />
              <label htmlFor="terms" className="terms-label">
                I agree to the <a href="#" className="terms-link">Terms of Service</a> and <a href="#" className="terms-link">Privacy Policy</a>
              </label>
            </div>
            <button type="submit" className={`auth-btn create-account-btn${isLoading ? ' loading' : ''}`} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span> Creating...
                </>
              ) : (
                'Create Account'
              )}
            </button>
            <div className="divider">
              <span className="divider-text">or continue with</span>
            </div>
            <div className="oauth-buttons">
              <button type="button" className="oauth-btn google-btn" disabled={isLoading}>
                <span role="img" aria-label="Google" className="oauth-icon">🔍</span> Google
              </button>
              <button type="button" className="oauth-btn github-btn" disabled={isLoading}>
                <span role="img" aria-label="GitHub" className="oauth-icon">⚡</span> GitHub
              </button>
            </div>
            <div className="auth-footer">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in here</Link>
            </div>
          </form>
        </div>
        <div className="auth-illustration slide-in">
          <div className="illustration-content">
            <div className="welcome-text">
              <h2 className="journey-title">Start Your Journey</h2>
              <p className="journey-subtitle">Join thousands of writers sharing their knowledge and passion</p>
              <div className="features-list">
                <div className="feature-item">
                  <span className="feature-icon-bg"><span className="feature-icon">✍️</span></span>
                  <span className="feature-text">Write & Publish</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon-bg"><span className="feature-icon">🌟</span></span>
                  <span className="feature-text">Build Your Audience</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon-bg"><span className="feature-icon">📈</span></span>
                  <span className="feature-text">Track Your Growth</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;