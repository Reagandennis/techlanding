'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  RotateCcw,
  RotateCw,
  Subtitles,
  BookmarkPlus,
  MessageSquare
} from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  lessonId: string;
  courseId: string;
  duration?: number;
  thumbnail?: string;
  captions?: { src: string; label: string; srcLang: string }[];
  onProgress?: (progress: number, timeWatched: number) => void;
  onComplete?: () => void;
  onBookmark?: (timestamp: number, note: string) => void;
  initialProgress?: number;
  autoPlay?: boolean;
  allowSpeedControl?: boolean;
  allowDownload?: boolean;
}

interface Bookmark {
  id: string;
  timestamp: number;
  note: string;
  createdAt: Date;
}

export default function VideoPlayer({
  videoUrl,
  title,
  lessonId,
  courseId,
  duration = 0,
  thumbnail,
  captions = [],
  onProgress,
  onComplete,
  onBookmark,
  initialProgress = 0,
  autoPlay = false,
  allowSpeedControl = true,
  allowDownload = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize video on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
      if (initialProgress > 0) {
        video.currentTime = (initialProgress / 100) * video.duration;
      }
    };

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      setCurrentTime(currentTime);
      
      // Update progress every 5 seconds to avoid too many API calls
      if (currentTime - lastProgressUpdate >= 5) {
        const progress = (currentTime / video.duration) * 100;
        onProgress?.(progress, currentTime);
        setLastProgressUpdate(currentTime);
        
        // Save progress to localStorage as backup
        localStorage.setItem(`lesson_progress_${lessonId}`, JSON.stringify({
          progress,
          timestamp: Date.now()
        }));
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
      // Final progress update
      onProgress?.(100, video.duration);
    };

    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [lessonId, initialProgress, onProgress, onComplete, lastProgressUpdate]);

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * video.duration;
    video.currentTime = newTime;
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    setVolume(newVolume);
    video.volume = newVolume;
    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const changePlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  }, []);

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        } else if ((container as any).msRequestFullscreen) {
          await (container as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, [isFullscreen]);

  const addBookmark = useCallback(() => {
    if (!bookmarkNote.trim()) return;

    const bookmark: Bookmark = {
      id: Date.now().toString(),
      timestamp: currentTime,
      note: bookmarkNote.trim(),
      createdAt: new Date(),
    };

    setBookmarks(prev => [...prev, bookmark]);
    onBookmark?.(currentTime, bookmarkNote.trim());
    setBookmarkNote('');
    setShowBookmarkForm(false);

    // Save to localStorage
    const savedBookmarks = JSON.parse(localStorage.getItem(`lesson_bookmarks_${lessonId}`) || '[]');
    savedBookmarks.push(bookmark);
    localStorage.setItem(`lesson_bookmarks_${lessonId}`, JSON.stringify(savedBookmarks));
  }, [currentTime, bookmarkNote, lessonId, onBookmark]);

  const jumpToBookmark = useCallback((timestamp: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = timestamp;
  }, []);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Load saved bookmarks
  useEffect(() => {
    const savedBookmarks = localStorage.getItem(`lesson_bookmarks_${lessonId}`);
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    }
  }, [lessonId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, skip, handleVolumeChange, volume, toggleMute, toggleFullscreen]);

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${isFullscreen ? 'w-screen h-screen' : 'w-full aspect-video'}`}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnail}
        className="w-full h-full"
        autoPlay={autoPlay}
        preload="metadata"
        onClick={togglePlayPause}
      >
        {captions.map((caption, index) => (
          <track
            key={index}
            kind="captions"
            src={caption.src}
            srcLang={caption.srcLang}
            label={caption.label}
            default={index === 0 && showCaptions}
          />
        ))}
      </video>

      {/* Loading Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Play Button Overlay */}
      {!isPlaying && !isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlayPause}
            className="w-20 h-20 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
          >
            <Play className="w-8 h-8 text-white ml-1" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div
          ref={progressBarRef}
          className="w-full h-2 bg-gray-600 rounded-full mb-4 cursor-pointer relative group"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-red-500 rounded-full relative"
            style={{ width: `${(currentTime / videoDuration) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          {/* Bookmarks on progress bar */}
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="absolute top-0 w-1 h-full bg-yellow-400 cursor-pointer"
              style={{ left: `${(bookmark.timestamp / videoDuration) * 100}%` }}
              onClick={(e) => {
                e.stopPropagation();
                jumpToBookmark(bookmark.timestamp);
              }}
              title={`${formatTime(bookmark.timestamp)}: ${bookmark.note}`}
            />
          ))}
        </div>

        {/* Control Bar */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            {/* Play/Pause */}
            <button onClick={togglePlayPause} className="hover:text-red-400 transition-colors">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            {/* Skip buttons */}
            <button onClick={() => skip(-10)} className="hover:text-red-400 transition-colors">
              <RotateCcw className="w-5 h-5" />
            </button>
            <button onClick={() => skip(10)} className="hover:text-red-400 transition-colors">
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-2">
              <button onClick={toggleMute} className="hover:text-red-400 transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Time Display */}
            <span className="text-sm">
              {formatTime(currentTime)} / {formatTime(videoDuration)}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Bookmark */}
            <button
              onClick={() => setShowBookmarkForm(true)}
              className="hover:text-yellow-400 transition-colors"
              title="Add bookmark"
            >
              <BookmarkPlus className="w-5 h-5" />
            </button>

            {/* Captions */}
            {captions.length > 0 && (
              <button
                onClick={() => setShowCaptions(!showCaptions)}
                className={`hover:text-red-400 transition-colors ${showCaptions ? 'text-red-400' : ''}`}
                title="Toggle captions"
              >
                <Subtitles className="w-5 h-5" />
              </button>
            )}

            {/* Settings */}
            {allowSpeedControl && (
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="hover:text-red-400 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                {showSettings && (
                  <div className="absolute bottom-8 right-0 bg-black bg-opacity-90 rounded-lg p-3 min-w-32">
                    <div className="text-sm font-medium mb-2">Playback Speed</div>
                    {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => changePlaybackRate(rate)}
                        className={`block w-full text-left px-2 py-1 text-sm hover:bg-gray-700 rounded ${
                          playbackRate === rate ? 'text-red-400' : ''
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="hover:text-red-400 transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bookmark Form Modal */}
      {showBookmarkForm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Bookmark</h3>
            <p className="text-sm text-gray-600 mb-3">
              Bookmark at {formatTime(currentTime)}
            </p>
            <textarea
              value={bookmarkNote}
              onChange={(e) => setBookmarkNote(e.target.value)}
              placeholder="Add a note for this bookmark..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={addBookmark}
                disabled={!bookmarkNote.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-2 rounded-lg transition-colors"
              >
                Add Bookmark
              </button>
              <button
                onClick={() => {
                  setShowBookmarkForm(false);
                  setBookmarkNote('');
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookmarks Sidebar (when there are bookmarks) */}
      {bookmarks.length > 0 && !isFullscreen && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-80 rounded-lg p-3 w-64 max-h-48 overflow-y-auto">
          <h4 className="text-white text-sm font-medium mb-2">Bookmarks</h4>
          <div className="space-y-2">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="text-xs">
                <button
                  onClick={() => jumpToBookmark(bookmark.timestamp)}
                  className="text-yellow-400 hover:text-yellow-300 font-medium"
                >
                  {formatTime(bookmark.timestamp)}
                </button>
                <p className="text-gray-300 mt-1 line-clamp-2">{bookmark.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="absolute top-4 left-4 text-white text-xs bg-black bg-opacity-50 rounded px-2 py-1 opacity-50 hover:opacity-100 transition-opacity">
        Space: Play/Pause | ←→: Skip | ↑↓: Volume | M: Mute | F: Fullscreen
      </div>
    </div>
  );
}