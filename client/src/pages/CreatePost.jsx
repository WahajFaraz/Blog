import axios from '../api/axios';
import { useState } from 'react';
import './CreatePost.css';
import Editor from '../components/Editor';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    category: '',
    featured: false
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState({});

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value
    }));
  };

  // Helper to get token and headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  // Formatting helpers
  const insertAtCursor = (before, after = before) => {
    const textarea = document.getElementById('content');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = formData.content;
    const selected = value.substring(start, end);
    const newValue =
      value.substring(0, start) + before + selected + after + value.substring(end);
    setFormData((prev) => ({ ...prev, content: newValue }));
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = end + before.length;
    }, 0);
  };

  const handleToolbar = (type) => {
    if (type === 'bold') insertAtCursor('**', '**');
    if (type === 'italic') insertAtCursor('_', '_');
    if (type === 'link') insertAtCursor('[', '](url)');
    if (type === 'image') insertAtCursor('![alt](', ')');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/posts', { ...formData, status: 'published' }, getAuthHeaders());
      alert('Post published successfully!');
    } catch (err) {
      alert('Failed to publish post.');
    }
  };

  const handleSaveDraft = async () => {
    try {
      await axios.post('/posts', { ...formData, status: 'draft' }, getAuthHeaders());
      alert('Draft saved successfully!');
    } catch (err) {
      alert('Failed to save draft.');
    }
  };

  const handlePreview = () => {
    setPreviewData(formData);
    setShowPreview(true);
  };

  const closePreview = () => setShowPreview(false);

  return (
    <div className="create-post">
      <div className="container">
        <div className="create-post-header fade-in">
          <h1 className="page-title">Create New Post</h1>
          <p className="page-subtitle">Share your thoughts and insights with the world</p>
        </div>

        <div className="create-post-content">
          <form onSubmit={handleSubmit} className="post-form card scale-in">
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter an engaging title for your post"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="excerpt" className="form-label">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  className="form-input form-textarea"
                  placeholder="Write a brief summary of your post..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category" className="form-label">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-input form-select"
                  >
                    <option value="">Select a category</option>
                    <option value="technology">Technology</option>
                    <option value="design">Design</option>
                    <option value="business">Business</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="education">Education</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="tags" className="form-label">
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. react, javascript, web development"
                  />
                  <small className="form-help">Separate tags with commas</small>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-text">Mark as featured post</span>
                </label>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Content</h3>
              
              <div className="form-group">
                <label htmlFor="content" className="form-label">
                  Post Content <span className="required">*</span>
                </label>
                <Editor
                  value={formData.content}
                  onChange={val => setFormData(prev => ({ ...prev, content: val }))}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={handleSaveDraft}>
                Save as Draft
              </button>
              <button type="button" className="btn btn-secondary" onClick={handlePreview}>
                Preview
              </button>
              <button type="submit" className="btn btn-primary">
                Publish Post
              </button>
            </div>
          </form>

          <div className="writing-tips card slide-in">
            <h3 className="tips-title">✨ Writing Tips</h3>
            <ul className="tips-list">
              <li><span role="img" aria-label="lightbulb">💡</span> Start with a compelling headline that grabs attention</li>
              <li><span role="img" aria-label="lightbulb">💡</span> Write an engaging introduction that hooks your readers</li>
              <li><span role="img" aria-label="lightbulb">💡</span> Use subheadings to break up your content</li>
              <li><span role="img" aria-label="lightbulb">💡</span> Include relevant images and examples</li>
              <li><span role="img" aria-label="lightbulb">💡</span> End with a strong conclusion or call-to-action</li>
              <li><span role="img" aria-label="lightbulb">💡</span> Proofread your post before publishing</li>
            </ul>
          </div>
        </div>

        {showPreview && (
          <div className="preview-modal">
            <div className="preview-content">
              <button className="close-preview" onClick={closePreview}>×</button>
              <h2>{previewData.title}</h2>
              <p><em>{previewData.excerpt}</em></p>
              <div style={{ margin: '24px 0' }}>
                <strong>Category:</strong> {previewData.category}<br/>
                <strong>Tags:</strong> {previewData.tags}<br/>
                <strong>Featured:</strong> {previewData.featured ? 'Yes' : 'No'}
              </div>
              <div style={{ whiteSpace: 'pre-line', borderTop: '1px solid #eee', paddingTop: 16 }}>
                {previewData.content}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CreatePost;

/* Add to CreatePost.css:
.preview-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-content {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  position: relative;
}
.close-preview {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
}
*/