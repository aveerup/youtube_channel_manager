import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../output.css';
import moment from 'moment-timezone'

const VideoDragDrop = ({ onVideoSelect, canChangeViewState }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [videoPath, setVideoPath] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [uploadedVideoData, setuploadedVideoData] = useState(null);
  const [datetime, setDatetime] = useState('');
  const [timezone, setTimezone] = useState(moment.tz.guess());
  const dropRef = useRef(null);

  const timezones = moment.tz.names();

  useEffect(() => {
    if (uploadedVideoData) {
      canChangeViewState.setCanChangeView(false);
    } else {
      canChangeViewState.setCanChangeView(true);
    }
  }, [uploadedVideoData]);
    
  const generateTitle = async () => {
    try {
      const response = await axios.post('/api/generate/title', {
        id: uploadedVideoData ? uploadedVideoData.id : null,
        duration: uploadedVideoData ? uploadedVideoData.duration : null,
        cloudinary_id: uploadedVideoData ? uploadedVideoData.cloudinary_id : null
      });

      setuploadedVideoData(prevData => ({
        ...prevData,
        title: response.data.title
      }));
    
      onVideoSelect({ title: response.data.title, description: response.data.description, keywords: response.data.keywords });

    } catch (error) {
      console.error('Error generating title:', error);
    }
  };

  const generateDescription = async () => {
    try {
      const response = await axios.post('/api/generate/description', {
        id: uploadedVideoData ? uploadedVideoData.id : null,
        duration: uploadedVideoData ? uploadedVideoData.duration : null,
        cloudinary_id: uploadedVideoData ? uploadedVideoData.cloudinary_id : null
      });

      setuploadedVideoData(prevData => ({
        ...prevData,
        description: response.data.description
      }));
    
      onVideoSelect({ title: response.data.title, description: response.data.description, keywords: response.data.keywords });

    } catch (error) {
      console.error('Error generating description:', error);
    }
  };
  
  const generateKeywords = async () => {
    try {
      const response = await axios.post('/api/generate/keywords', {
        id: uploadedVideoData ? uploadedVideoData.id : null,
        duration: uploadedVideoData ? uploadedVideoData.duration : null,
        cloudinary_id: uploadedVideoData ? uploadedVideoData.cloudinary_id : null
      });

      setuploadedVideoData(prevData => ({
        ...prevData,
        keywords: response.data.keywords
      }));
    
      onVideoSelect({ title: response.data.title, description: response.data.description, keywords: response.data.keywords });

    } catch (error) {
      console.error('Error generating keywords:', error);
    }
  }; 

  const uploadVideoToYoutube = async () => {
    try {
      let published_at = null;
      if (datetime) {
        published_at = moment.tz(datetime, timezone).toISOString();
        console.log('Converted publish time:', published_at);
      }
      console.log('Uploading video to YouTube with data:', uploadedVideoData);
      const videoData = {
        videoId : uploadedVideoData ? uploadedVideoData.id : null,
        published_at: published_at
      }
      const response = await axios.post('/api/youtube/upload', videoData);
      console.log('Upload response:', response.data);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const cancelUpload = async () => {
    try {
      if (uploadedVideoData && uploadedVideoData.id) {
        await axios.post('/api/cancel', { videoId: uploadedVideoData.id });
        setuploadedVideoData(null);
        setUploadProgress(0);
        setUploadSuccess(false);
        setGenerateLoading(false);
        setPreviewUrl(null);
        setVideoPath('');
        setDatetime('');
        setTimezone(moment.tz.guess());
        onVideoSelect(null);
        canChangeViewState.setCanChangeView(true);
      }
  }catch (error) {
      console.error('Cancel upload error:', error);
    }
  };

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
        
        canChangeViewState.setCanChangeView(false);
        setGenerateLoading(true);


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
        
          setUploadSuccess(true);
          setGenerateLoading(false);
          setuploadedVideoData(response.data.video);
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
    <>
      <div
        ref={dropRef}
        className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ease-in-out ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          {previewUrl && (
            <video 
              controls 
              src={previewUrl} 
              className="w-full rounded-lg shadow-lg max-h-[400px]" 
            />
          )}
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              >
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Uploading: {uploadProgress}%
              </p>
            </div>
          )}

          <div className="text-center">
            {videoPath ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Selected video:</p>
                <p className="text-sm text-gray-500 truncate">{videoPath}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <svg 
                    className="w-12 h-12 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3-3m3 3v-12" 
                    />
                  </svg>
                </div>
                <p className="text-base text-gray-900">
                  Drag and drop your video here
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: MP4, MOV, AVI, etc.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {generateLoading && (
        <div className="mt-4 text-center text-blue-600">
          Generating... please wait. This may take a few minutes.
        </div>
      )}

      {uploadSuccess && (
        <div className="mt-6 space-y-4 bg-white rounded-lg p-6 shadow-sm">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Generated Title
            </label>
            <input
              type="text"
              id="title"
              value={uploadedVideoData? uploadedVideoData.title : ''}
              onChange={(e) => setuploadedVideoData(prev => (prev?{...prev, title:e.target.value}:{title: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Video title"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={generateTitle}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium transition-colors duration-200"
            >
              Generate Again
            </button>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Generated Description
            </label>
            <textarea
              id="description"
              value={uploadedVideoData? uploadedVideoData.description : ''}
              onChange={(e) => setuploadedVideoData(prev => (prev?{...prev, description:e.target.value}:{description: e.target.value}))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Video description"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={generateDescription}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium transition-colors duration-200"
            >
              Generate Again
            </button>
          </div>

          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
              Generated Keywords
            </label>
            <input
              type="text"
              id="keywords"
              value={uploadedVideoData? uploadedVideoData.keywords : ''}
              onChange={(e) => setuploadedVideoData(prev => (prev?{...prev, keywords:e.target.value}:{keywords: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Comma-separated keywords"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={generateKeywords}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium transition-colors duration-200"
            >
              Generate Again
            </button>
          </div>

          <div className="">
            <div>
              <label htmlFor="publishTime" className="block text-sm font-medium text-red-700 mb-1">
                Publish Time (optional; No Publish time set means video will be kept private)
              </label>
              <input
                type="datetime-local"
                id="publishTime"
                value={datetime? datetime : ''}
                onChange={(e) => { 
                  setDatetime(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Comma-separated keywords"
              />
            </div>

            <div>
              <label className="flex flex-col">
                <span className="mb-1 text-sm font-semibold">Select Timezone</span>
                <select
                  value={timezone}
                  onChange={(e) => {
                    setTimezone(e.target.value);
                  }}
                  className="border p-2 rounded"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setDatetime('')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium transition-colors duration-200"
            >
              Clear Publish Time
            </button>
          </div>

          <div className="flex justify-center mt-4">
            <button
              onClick={cancelUpload}
              className="px-4 py-2 m-auto bg-red-600 opacity-60 text-white text-base rounded-md hover:opacity-100 focus:outline-none focus:ring-2 active:ring-blue-500 focus:ring-offset-2 font-medium transition-colors duration-200"
            >
              Cancel Upload
            </button>
            <button
              onClick={uploadVideoToYoutube}
              className="px-4 py-2 m-auto bg-green-600 opacity-60 text-white text-base rounded-md hover:opacity-100 focus:outline-none focus:ring-2 active:ring-blue-500 focus:ring-offset-2 font-medium transition-colors duration-200"
            >
              Upload Video to YouTube
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoDragDrop;