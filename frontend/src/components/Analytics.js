import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Chart } from 'chart.js/auto';
import { Bar, Line } from 'react-chartjs-2';

const Analytics = () => {
    const [ channelData, setChannelData ] = useState(null);
    const [channelAnalytics, setChannelAnalytics] = useState(null);
    const [ showGraph, setShowGraph ] = useState(true);
    const [ selectedOption, setSelectedOption ] = useState("24");

    useEffect(() => {
        async function fetchDataAnalytics(){
            try{
                const channelDataResponse = await axios.get('/api/channel/data');
                setChannelData(channelDataResponse.data);

                const channelAnalyticsResponse = await axios.post('/api/channel/analytics', {
                    month_range: selectedOption
                });
                setChannelAnalytics(channelAnalyticsResponse.data); 
                
            } catch (error){
                console.error('Error fetching channel data:', error);
            }
        }
        fetchDataAnalytics();  
    }, []);

    useEffect(() => {
        async function fetchAnalytics(){
            try{
                const channelAnalyticsResponse = await axios.post('/api/channel/analytics', {
                    month_range: selectedOption
                });
                setChannelAnalytics(channelAnalyticsResponse.data); 
                
            } catch (error){
                console.error('Error fetching channel analytics:', error);
            }
        }
        fetchAnalytics();  
    }, [selectedOption]);

    return (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
            {/* Channel Header */}
            <div className="flex items-center space-x-4 mb-6">
                <img 
                    src={channelData?.channelInfo?.thumbnails?.medium?.url} 
                    alt={channelData?.channelInfo?.title}
                    className="w-24 h-24 rounded-full"
                />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{channelData?.channelInfo?.title}</h1>
                    <a 
                        href={`https://youtube.com/${channelData?.channelInfo?.customUrl}`}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline"
                    >
                        {channelData?.channelInfo?.customUrl}
                    </a>
                </div>
                <div className="flex items-center ml-auto space-x-4">
                    <button 
                        className="rounded p-1.5 active:bg-white h-[60%] hover:bg-gray-400"
                        onClick={() => setShowGraph(false)}
                    >
                        Recent Videos
                    </button>
                    <button 
                        className="rounded p-1.5 active:bg-white h-[60%] hover:bg-gray-400"
                        onClick={() => setShowGraph(true)}
                    >
                        Stats Graphs
                    </button>
                </div>
            </div>

            {/* Channel Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Subscribers</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {parseInt(channelData?.channelInfo?.statistics?.subscriberCount).toLocaleString()}
                    </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {parseInt(channelData?.channelInfo?.statistics?.viewCount).toLocaleString()}
                    </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Videos</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {parseInt(channelData?.channelInfo?.statistics?.videoCount).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Recent Videos */}
            {!showGraph ?
                <div>
                    <h2 className="text-xl font-semibold mb-4">Recent Videos</h2>
                    <div className="space-y-4">
                        {channelData?.recentVideos?.map((video) => (
                            <div key={video.id.videoId} className="flex space-x-4 bg-gray-50 p-4 rounded-lg">
                                <img 
                                    src={video.snippet.thumbnails.medium.url}
                                    alt={video.snippet.title}
                                    className="w-48 h-27 object-cover rounded"
                                />
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">
                                        {video.snippet.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-2">
                                        {video.snippet.description}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Published: {new Date(video.snippet.publishedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div> :
                <div className="flex flex-col items-center">

                <div className="m-4">
                    <label htmlFor="options" className="block mb-2 text-gray-700 font-medium">
                        Choose an option:
                    </label>
                    <select
                        id="options"
                        value={selectedOption}
                        onChange={(e)=>setSelectedOption(e.target.value)}
                        className="block w-60 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="4">last 4 months</option>
                        <option value="8">last 8 months</option>
                        <option value="12">last 12 months</option>
                        <option value="16">last 16 months</option>
                        <option value="20">last 20 months</option>
                        <option value="24">last 24 months</option>
                        <option value="28">last 28 months</option>
                        <option value="32">last 32 months</option>
                        <option value="36">last 36 months</option>
                    </select>
                    </div>

                    <div className="m-10 flex flex-col items-center w-full shadow-[0_0_15px_rgba(0,0,0,0.3)] rounded-2xl">
                        <h3 className="text-xl font-semibold mb-4 mt-4">views</h3>
                        <div className="w-[700px]">
                            <Bar data={{
                                labels: channelAnalytics?.analytics?.labels,
                                datasets: [
                                    {
                                        id: 1,
                                        label: 'Views',
                                        data: channelAnalytics?.analytics?.views,
                                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                    },
                                ],
                            }} 
                            />
                        </div>
                    </div>

                    <div className="m-10 flex flex-col items-center w-full shadow-[0_0_15px_rgba(0,0,0,0.3)] rounded-2xl">
                        <h3 className="text-xl font-semibold mb-4 mt-4">estimated minutes watched</h3>
                        <div className="w-[700px]">
                            <Bar data={{
                                labels: channelAnalytics?.analytics?.labels,
                                datasets: [
                                    {
                                        id: 1,
                                        label: 'estimated minutes watched',
                                        data: channelAnalytics?.analytics?.estimatedMinutesWatched,
                                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                                    },
                                ],
                            }} 
                            />
                        </div>
                    </div>
                    
                    <div className="m-10 flex flex-col items-center w-full shadow-[0_0_15px_rgba(0,0,0,0.3)] rounded-2xl">
                        <h3 className="text-xl font-semibold mb-4 mt-4">average view duration</h3>
                        <div className="w-[700px]">
                            <Bar data={{
                                labels: channelAnalytics?.analytics?.labels,
                                datasets: [
                                    {
                                        id: 1,
                                        label: 'average view duration',
                                        data: channelAnalytics?.analytics?.averageViewDuration,
                                        backgroundColor: 'rgba(255, 206, 86, 0.6)',
                                    },
                                ],
                            }} 
                            />
                        </div>
                    </div>

                    <div className="m-10 flex flex-col items-center w-full shadow-[0_0_15px_rgba(0,0,0,0.3)] rounded-2xl">
                        <h3 className="text-xl font-semibold mb-4 mt-4">subscribers gained</h3>
                        <div className="w-[700px]">
                            <Bar data={{
                                labels: channelAnalytics?.analytics?.labels,
                                datasets: [
                                    {
                                        id: 1,
                                        label: 'subscribers gained',
                                        data: channelAnalytics?.analytics?.subscribersGained,
                                        backgroundColor: 'rgba(153, 102, 255, 0.6)',
                                    },
                                ],
                            }} 
                            />
                        </div>
                    </div>
                </div>

            }
        </div>
    );
};

export default Analytics;