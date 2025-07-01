import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './Editor.css';

const fontSizes = ['small', false, 'large', 'huge'];
const fontFamilies = [
  'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy'
];

const modules = {
  toolbar: [
    [{ 'font': fontFamilies }],
    [{ 'size': fontSizes }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link', 'image', 'video'],
    ['clean']
  ]
};

const formats = [
  'font', 'size', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'script', 'header', 'align',
  'blockquote', 'code-block', 'list', 'bullet', 'indent',
  'link', 'image', 'video'
];

const Editor = ({ value, onChange }) => {
  return (
    <div className="editor-container">
      <span className="floating-label">Blog Content</span>
      <ReactQuill
        className="editor-quill"
        // theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="Write your blog content here..."
      />
    </div>
  );
};

export default Editor;