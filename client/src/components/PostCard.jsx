import React from "react";
import { Link } from "react-router-dom";
import { FiMessageCircle, FiArrowRight } from 'react-icons/fi';
import { MdAccessTime } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import "./PostCard.css";

function extractFirstMedia(content) {
  if (!content) return null;
  const imgMatch = content.match(/<img[^>]+src=["']([^"'>]+)["']/i);
  if (imgMatch) return { type: 'image', src: imgMatch[1] };
  const videoMatch = content.match(/<video[^>]+src=["']([^"'>]+)["']/i);
  if (videoMatch) return { type: 'video', src: videoMatch[1] };
  const sourceMatch = content.match(/<source[^>]+src=["']([^"'>]+)["']/i);
  if (sourceMatch) return { type: 'video', src: sourceMatch[1] };
  return null;
}

function getFirstTwoLines(text) {
  if (!text) return '';
  const plain = text.replace(/<[^>]+>/g, '').replace(/\r/g, '');
  const lines = plain.split(/\n|\.|\!/).filter(Boolean);
  return lines.slice(0, 2).join('. ') + (lines.length > 2 ? '...' : '');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase();
};

const calculateReadTime = (content) => {
  if (!content) return 1;
  const plain = content.replace(/<[^>]+>/g, '');
  const wordCount = plain.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

const PostCard = ({ post, isAuthor, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const firstMedia = extractFirstMedia(post.content);
  const mediaUrl = firstMedia ? firstMedia.src : post.mediaUrl;
  const mediaType = firstMedia ? firstMedia.type : (post.mediaUrl && post.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image');
  const description = getFirstTwoLines(post.content);
  const publishedDate = formatDate(post.createdAt);
  const readTime = post.readTime || `${calculateReadTime(post.content)} min read`;
  const tags = post.tags || post.category ? [post.category] : [];
  const authorName = post.author?.username || 'Unknown';

  return (
    <motion.div
      className="blogcard-card"
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18, duration: 0.7 }}
      whileHover={{ scale: 1.03, rotate: -1, boxShadow: "0 16px 48px 0 rgba(80,80,120,0.22)" }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {mediaUrl && (
        <motion.div
          className="blogcard-media"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
          style={{ position: 'relative' }}
        >
          {mediaType === 'video' ? (
            <video src={mediaUrl} controls preload="metadata" />
          ) : (
            <img src={mediaUrl} alt="Post media" />
          )}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="blogcard-hover-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(120deg, #7f53ac 0%, #647dee 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="blogcard-readnow-btn"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5em',
                  background: 'rgba(255,255,255,0.95)',
                  color: '#7f53ac',
                  fontWeight: 700,
                  fontSize: '1.1em',
                  borderRadius: '999px',
                  padding: '0.6em 1.5em',
                  boxShadow: '0 4px 24px 0 rgba(127,83,172,0.13)',
                  cursor: 'pointer',
                  border: 'none',
                  outline: 'none',
                  textDecoration: 'none',
                }}
                as={Link}
                to={`/post/${post._id}`}
              >
                Read Now <FiArrowRight />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
      <div className="blogcard-content">
        <div className="blogcard-tags">
          {(post.tags || []).map((tag, idx) => (
            <motion.span
              className="blogcard-tag"
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.07, duration: 0.3 }}
            >
              {tag}
            </motion.span>
          ))}
        </div>
        <h3 className="blogcard-title">
          <Link to={`/post/${post._id}`}>{post.title}</Link>
        </h3>
        <div className="blogcard-meta">
          <span className="blogcard-date">{publishedDate}</span>
          <span className="blogcard-dot">•</span>
          <span className="blogcard-readtime"><MdAccessTime style={{verticalAlign: 'middle', marginRight: 4}} />{readTime}</span>
        </div>
        <p className="blogcard-description">{description}</p>
        <div className="blogcard-footer">
          <div className="blogcard-author">
            <span className="blogcard-avatar">{getInitials(authorName)}</span>
            <span className="blogcard-authorname">{authorName}</span>
            {/* <span className="blogcard-role">Writer</span> */}
          </div>
          <Link to={`/post/${post._id}`} className="blogcard-comments-link" title="View comments">
            <FiMessageCircle className="blogcard-comments-icon" />
            <span className="blogcard-comments-count">{Array.isArray(post.comments) ? post.comments.length : 0}</span>
          </Link>
        </div>
        {isAuthor && (
          <div className="blogcard-actions">
            <button className="blogcard-edit" onClick={onEdit}>Edit</button>
            <button className="blogcard-delete" onClick={onDelete}>Delete</button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PostCard;