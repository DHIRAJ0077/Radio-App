"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const stations = [
  {
    id: 1,
    name: "BBC Radio 1",
    url: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one",
    logo: "/radio-logos/placeholder.svg"
  },
  {
    id: 2,
    name: "Capital FM",
    url: "https://media-ssl.musicradio.com/CapitalUK",
    logo: "/radio-logos/placeholder.svg"
  },
  {
    id: 3,
    name: "Classic FM",
    url: "https://media-ssl.musicradio.com/ClassicFM",
    logo: "/radio-logos/placeholder.svg"
  },
  {
    id: 4,
    name: "Heart Radio",
    url: "https://media-ssl.musicradio.com/HeartUK",
    logo: "/radio-logos/placeholder.svg"
  },
  {
    id: 5,
    name: "Smooth Radio",
    url: "https://media-ssl.musicradio.com/SmoothUK",
    logo: "/radio-logos/placeholder.svg"
  }
];

export default function RadioPlayer() {
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize with the first station
    if (stations.length > 0 && !currentStation) {
      setCurrentStation(stations[0]);
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
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

  return (
    <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">Web Radio Player</h2>
      
      {/* Current station display */}
      <div className="flex items-center justify-center mb-8">
        <div className="w-24 h-24 relative mr-4">
          {currentStation?.logo ? (
            <Image 
              src={currentStation.logo} 
              alt={`${currentStation.name} logo`}
              fill
              className="object-contain rounded-md"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">No Logo</span>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            {currentStation?.name || "Select a station"}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {isPlaying ? "Now Playing" : "Paused"}
          </p>
        </div>
      </div>

      {/* Audio element */}
      <audio
        ref={audioRef}
        src={currentStation?.url}
        preload="none"
      />

      {/* Controls */}
      <div className="flex items-center justify-center mb-8">
        <button
          onClick={togglePlayPause}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center focus:outline-none"
        >
          {isPlaying ? (
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

      {/* Volume control */}
      <div className="flex items-center mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a7.975 7.975 0 015.657 2.343m-5.657 5.657a7.975 7.975 0 01-5.657-2.343M9 9.879l3-3 3 3M9 14.121l3 3 3-3" />
        </svg>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <span className="ml-2 text-gray-600 dark:text-gray-300 w-8">{volume}%</span>
      </div>

      {/* Station list */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Available Stations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stations.map((station) => (
            <button
              key={station.id}
              onClick={() => handleStationChange(station)}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                currentStation?.id === station.id
                  ? "bg-blue-100 dark:bg-blue-900"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <div className="w-10 h-10 relative mr-3">
                {station.logo ? (
                  <Image 
                    src={station.logo} 
                    alt={`${station.name} logo`}
                    fill
                    className="object-contain rounded-md"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-600 rounded-md"></div>
                )}
              </div>
              <span className={`font-medium ${
                currentStation?.id === station.id
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-200"
              }`}>
                {station.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
