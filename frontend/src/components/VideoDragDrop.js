import React, { useState, useRef } from 'react';
import axios from 'axios';
import './VideoDragDrop.css';

const VideoDragDrop = ({ onVideoSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [videoPath, setVideoPath] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const dropRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setVideoPath(file.name);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        // Create FormData and append file
        const formData = new FormData();
        formData.append('video', file);

        try {
          const response = await axios.post('/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            },
          });
        
          onVideoSelect(response.data.video);
          setVideoPath(response.data.video.cloudinary_url);
        } catch (error) {
          console.error('Upload failed:', error);
          alert('Failed to upload video');
        }
      } else {
        alert('Please drop a video file');
      }
    }
  };

  return (
    <div
      ref={dropRef}
      className={`video-drop-box ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="drop-content">
        {previewUrl && (
          <video controls src={previewUrl} style={{ maxWidth: '100%' }} />
        )}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <span>{uploadProgress}%</span>
          </div>
        )}
        {videoPath ? (
          <p>Selected video: {videoPath}</p>
        ) : (
          <>
            <p>Drag and drop your video here</p>
            <p className="sub-text">Supported formats: MP4, MOV, AVI, etc.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoDragDrop;