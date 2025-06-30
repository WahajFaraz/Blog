import { useState } from 'react';
import axios from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/userSlice';
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [welcome, setWelcome] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    dispatch(signInStart());
    try {
      const res = await axios.post('/users/login', { email, password });
      const token = res.data.token;
      localStorage.setItem('token', token);
      const userRes = await axios.get('/users/me', { headers: { Authorization: `Bearer ${token}` } });
      dispatch(signInSuccess({ ...userRes.data, token }));
      setWelcome({ username: userRes.data.username, profilePic: userRes.data.profilePic });
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      dispatch(signInFailure(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card fade-in">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your account to continue</p>
          </div>
          <form onSubmit={handleLogin} className="auth-form">
            {error && <div className="error-text">{error}</div>}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input"
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <span style={{ position: 'absolute', right: 12, top: 44, cursor: 'pointer', color: '#94a3b8', fontSize: 16 }} onClick={() => setShowPassword(v => !v)}>
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: 16, color: '#334155', fontWeight: 500 }}>
                <input type="checkbox" style={{ marginRight: 8, width: 18, height: 18 }} />
                Remember me
              </label>
              <a href="#" style={{ color: '#6366f1', fontSize: 16, textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
            </div>
            <button 
              type="submit" 
              className={`auth-btn${isLoading ? ' loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          <div className="auth-divider">
            <span>or continue with</span>
          </div>
          <div className="social-buttons">
            <button className="social-btn google-btn">
              <span className="social-icon">🔍</span>
              Google
            </button>
            <button className="social-btn github-btn">
              <span className="social-icon">⚡</span>
              GitHub
            </button>
          </div>
          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Register</Link>
            </p>
          </div>
        </div>
        <div className="auth-illustration slide-in">
          <div className="illustration-content">
            <div className="welcome-text">
              <h2>Welcome Back!</h2>
              <p>Sign in to access your personalized blog dashboard</p>
              <div className="features-list">
                <div className="feature-item">
                  <span className="feature-icon">🔒</span>
                  <span>Secure Login</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📝</span>
                  <span>Write & Manage Posts</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <span>Track Your Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {welcome && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{ background: 'white', borderRadius: 16, padding: '2rem 2.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.13)', textAlign: 'center' }}>
              <img src={welcome.profilePic || `https://ui-avatars.com/api/?name=${welcome.username}&background=6366f1&color=fff`} alt="Profile" style={{ width: 70, height: 70, borderRadius: '50%', marginBottom: 16, objectFit: 'cover', border: '2px solid #6366f1' }} />
              <h2 style={{ margin: 0 }}>Welcome, {welcome.username}!</h2>
              <p style={{ color: '#64748b', marginTop: 8 }}>Redirecting...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;