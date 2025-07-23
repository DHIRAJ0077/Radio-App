"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import stations from '../data/stations';
import Toast from './Toast';

export default function RadioPlayerClient() {
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const audioRef = useRef(null);
  
  // Filter stations based on search query
  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Initialize with the first station
    if (stations.length > 0 && !currentStation) {
      setCurrentStation(stations[0]);
    }
  }, [currentStation]);

  // Show toast notification
  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
  };
  
  // Hide toast notification
  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  useEffect(() => {
    // Reset error state when changing stations
    if (currentStation) {
      setStreamError(null);
    }
  }, [currentStation]);

  // Add event listeners to audio element
  useEffect(() => {
    const audio = audioRef.current;
    
    if (!audio) return;
    
    const handleError = (e) => {
      console.error('Audio error:', e);
      setIsLoading(false);
      
      // Prepare error message based on the error code
      let errorMessage = '';
      const stationName = currentStation?.name || 'Station';
      
      switch(e.target.error?.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = 'Playback aborted by the user.';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = `${stationName} is not online yet. Please try again later.`;
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = 'The audio format is not supported by your browser.';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = `${stationName} is not available or not supported.`;
          break;
        default:
          errorMessage = 'An unknown error occurred while playing the audio.';
      }
      
      // Set error in UI and show toast
      setStreamError(errorMessage);
      showToast(`${stationName} is not online yet. Please try again later.`, 'error');
      
      setIsPlaying(false);
    };
    
    const handleCanPlay = () => {
      setIsLoading(false);
    };
    
    // Add event listeners
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    
    // Cleanup
    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentStation, showToast]);

  useEffect(() => {
    const handlePlay = async () => {
      if (audioRef.current && isPlaying && currentStation) {
        setIsLoading(true);
        try {
          // Set the source directly before playing
          audioRef.current.src = currentStation.url;
          audioRef.current.load();
          await audioRef.current.play();
          setStreamError(null);
        } catch (error) {
          console.error('Error playing audio:', error);
          setStreamError(`Unable to play this station: ${error.message}`);
          // Reset the isPlaying state if play fails
          setIsPlaying(false);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (audioRef.current) {
      if (isPlaying) {
        handlePlay();
      } else {
        audioRef.current.pause();
      }
    }

    // Cleanup function
    return () => {
      // Store ref in a variable to avoid closure issues
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
      }
    };
  }, [isPlaying, currentStation]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handleStationChange = (station) => {
    setCurrentStation(station);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    setVolume(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Toast notification */}
      <Toast 
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
        duration={5000}
      />
      <div className="w-full max-w-4xl bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Web Radio Player</h2>
        
        {/* Current station display */}
        <div className="flex items-center justify-center mb-8">
          <div className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md w-full max-w-md border border-gray-200 dark:border-gray-700">
            {currentStation ? (
              <>
                <div className="w-24 h-24 mx-auto relative mb-4">
                  {currentStation.logo ? (
                    <Image 
                      src={currentStation.logo} 
                      alt={`${currentStation.name} logo`}
                      fill
                      className="object-contain rounded-lg shadow-sm"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">{currentStation.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">{currentStation.name}</h3>
                <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full mb-2">{currentStation.category}</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">Now Playing</p>
              </>
          ) : (
            <div className="py-6">
              <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Select a station to start listening</p>
            </div>
          )}
        </div>
      </div>

      {/* Audio element */}
      <audio
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
      >
        {/* Sources will be set dynamically in useEffect */}
      </audio>
      
    

      {/* Controls */}
      <div className="flex items-center justify-center mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={togglePlayPause}
            disabled={!currentStation || isLoading}
            className={`${currentStation ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'} text-white rounded-full w-16 h-16 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
            ) : isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Volume control */}
      <div className="flex items-center justify-center mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 w-full max-w-sm">
          <div className="flex items-center">
            <button 
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none"
              onClick={() => setVolume(Math.max(0, volume - 10))}
              aria-label="Decrease volume"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9" />
              </svg>
            </button>
            
            <div className="flex items-center flex-1 mx-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
                aria-label="Volume control"
              />
              <span className="ml-3 text-gray-600 dark:text-gray-300 w-10 text-right font-medium">{volume}%</span>
            </div>
            
            <button 
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 focus:outline-none"
              onClick={() => setVolume(Math.min(100, volume + 10))}
              aria-label="Increase volume"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

    </div>

    {/* Search input */}
    <div className="mb-8 mt-5">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input 
            type="search" 
            className="block w-full p-4 pl-12 text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all duration-200" 
            placeholder="Search for stations or categories..." 
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 focus:outline-none"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Stations list */}
    <div className="mt-8 border-2 border-gray-200 dark:border-gray-700 px-10 py-6 rounded-2xl">
      {searchQuery ? (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Search Results</h3>
          
          {/* Search results */}
          <div className="mt-4">
            {filteredStations.length > 0 ? (
              <div className="space-y-3">
                {filteredStations.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => handleStationChange(station)}
                    className={`flex items-center p-4 rounded-xl transition-all duration-200 border ${currentStation?.id === station.id
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 dark:from-blue-900/30 dark:to-purple-900/30 dark:border-blue-800 shadow-md"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800"}`}
                  >
                    <div className="w-12 h-12 relative mr-4 rounded-lg overflow-hidden shadow-sm">
                      {station.logo ? (
                        <Image 
                          src={station.logo} 
                          alt={`${station.name} logo`}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-xl font-bold">{station.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <span className={`font-medium block text-base ${currentStation?.id === station.id
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-gray-800 dark:text-gray-200"}`}>
                        {station.name}
                      </span>
                      <span className="inline-block px-2 py-0.5 mt-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        {station.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md">
                <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
                  No stations found matching &ldquo;{searchQuery}&rdquo;
                </p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
          <div>
            {[...new Set(stations.map(station => station.category))].sort().map(category => (
              <div key={category} className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                    {category === 'BBC' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    )}
                    {category === 'Music' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    )}
                    {category === 'Talk' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    )}
                    {category === 'Sports' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {category}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stations
                    .filter(station => station.category === category)
                    .map((station) => (
                    <button
                      key={station.id}
                      onClick={() => handleStationChange(station)}
                      className={`flex items-center p-4 rounded-xl transition-all duration-200 border ${currentStation?.id === station.id
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 dark:from-blue-900/30 dark:to-purple-900/30 dark:border-blue-800 shadow-md"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800"}`}
                    >
                      <div className="w-12 h-12 relative mr-4 rounded-lg overflow-hidden shadow-sm">
                        {station.logo ? (
                          <Image 
                            src={station.logo} 
                            alt={`${station.name} logo`}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-xl font-bold">{station.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <span className={`font-medium block text-base ${currentStation?.id === station.id
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-gray-800 dark:text-gray-200"}`}>
                          {station.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    
    </div>
  );
}
