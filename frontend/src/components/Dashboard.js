import React from 'react';
import { useState } from 'react';
import '../output.css';
import VideoDragDrop from './VideoDragDrop';
import Analytics from './Analytics';
import Warning from './Warning';

const Dashboard = ({ user, onLogout }) => {
  const handleVideoSelect = (videoPath) => {
    console.log('Selected video path:', videoPath);
    // Handle the video path here
  };

  const [ showAnalytics, setShowAnalytics ] = useState(false);
  const [ canChangeView, setCanChangeView ] = useState(true);
  const [ showWarning, setShowWarning ] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">YouTube Agent</h1>
            <button 
              onClick={onLogout}
              className="px-4 py-2 font-medium text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-col max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="w-full px-4 py-6 sm:px-0">
          <div className="flex bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center space-x-4">
              <img 
                src={user.photo} 
                alt="Profile"
                className="h-16 w-16 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center ml-auto space-x-4">
              <button 
                className="rounded p-1.5 active:bg-white h-[60%] hover:bg-gray-400"
                onClick={() => {
                  if(canChangeView)
                    setShowAnalytics(true)
                  else{
                    setShowWarning(true);
                    setTimeout(() => {
                      setShowWarning(false);
                    }, 4000);
                  }
                }}
              >
                Channel Analytics
              </button>
              <button 
                className="rounded p-1.5 active:bg-white h-[60%] hover:bg-gray-400"
                onClick={() => {
                  if (canChangeView)
                    setShowAnalytics(false);
                }}
              >
                Upload Video
              </button>
            </div>
          </div>

          { showWarning && <Warning message={"Video Upload in progress. Please cancel current upload to move elsewhere"} /> }
          
          {!showAnalytics ?
            <>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Upload Your Video
                  </h3>
                  <VideoDragDrop onVideoSelect={handleVideoSelect} canChangeViewState = {{canChangeView, setCanChangeView}} />
                </div>
              </div>
            </> : <Analytics />
          }

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
