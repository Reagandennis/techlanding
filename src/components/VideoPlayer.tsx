'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  SkipBack, 
  SkipForward,
  Bookmark,
  BookmarkCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'

interface VideoPlayerProps {
  src: string
  lessonId: string
  courseId: string
  title: string
  duration?: number
  thumbnail?: string
  onProgressUpdate?: (progress: number) => void
  onComplete?: () => void
}

interface Bookmark {
  id: string
  timestamp: number
  title: string
  note?: string
}

export default function VideoPlayer({
  src,
  lessonId,
  courseId,
  title,
  duration = 0,
  thumbnail,
  onProgressUpdate,
  onComplete
}: VideoPlayerProps) {
  const { user } = useUser()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(duration)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false)
  const [bookmarkTime, setBookmarkTime] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Auto-hide controls
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => {
      setCurrentTime(video.currentTime)
      
      // Update progress in database every 10 seconds
      if (video.currentTime % 10 < 0.5) {
        updateProgress(video.currentTime)
      }
    }

    const updateDuration = () => {
      setVideoDuration(video.duration)
      setLoading(false)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      updateProgress(video.duration, true)
      onComplete?.()
    }

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('ended', handleEnded)
    }
  }, [lessonId, courseId, onComplete])

  // Load saved progress and bookmarks
  useEffect(() => {
    if (user) {
      loadProgress()
      loadBookmarks()
    }
  }, [user, lessonId])

  const loadProgress = async () => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}/progress`)
      if (response.ok) {
        const data = await response.json()
        if (data.timeSpent && videoRef.current) {
          videoRef.current.currentTime = data.timeSpent
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error)
    }
  }

  const loadBookmarks = async () => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}/bookmarks`)
      if (response.ok) {
        const data = await response.json()
        setBookmarks(data)
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error)
    }
  }

  const updateProgress = async (time: number, completed = false) => {
    if (!user) return

    try {
      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeSpent: Math.floor(time),
          completed,
          courseId
        })
      })

      onProgressUpdate?.(completed ? 100 : (time / videoDuration) * 100)
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const togglePlay = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return
    const time = (value[0] / 100) * videoDuration
    videoRef.current.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return
    const vol = value[0] / 100
    videoRef.current.volume = vol
    setVolume(vol)
    setIsMuted(vol === 0)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    
    if (isMuted) {
      videoRef.current.volume = volume
      setIsMuted(false)
    } else {
      videoRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const skipBackward = () => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, currentTime - 10)
  }

  const skipForward = () => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.min(videoDuration, currentTime + 10)
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const changePlaybackRate = (rate: number) => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = rate
    setPlaybackRate(rate)
  }

  const addBookmark = async (title: string, note?: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/lessons/${lessonId}/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: Math.floor(currentTime),
          title,
          note
        })
      })

      if (response.ok) {
        const bookmark = await response.json()
        setBookmarks([...bookmarks, bookmark])
      }
    } catch (error) {
      console.error('Error adding bookmark:', error)
    }
  }

  const jumpToBookmark = (timestamp: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = timestamp
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }

  return (
    <div 
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseMove={showControlsTemporarily}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={thumbnail}
        className="w-full aspect-video"
        onClick={togglePlay}
        onLoadStart={() => setLoading(true)}
        onLoadedData={() => setLoading(false)}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Bookmarks */}
        {bookmarks.length > 0 && (
          <div className="absolute top-4 right-4 space-y-2 max-w-xs">
            {bookmarks.slice(0, 3).map((bookmark) => (
              <button
                key={bookmark.id}
                onClick={() => jumpToBookmark(bookmark.timestamp)}
                className="flex items-center gap-2 bg-black/50 text-white px-3 py-1 rounded-full text-xs hover:bg-black/70 transition-colors"
              >
                <BookmarkCheck className="h-3 w-3" />
                <span>{bookmark.title}</span>
                <span className="text-gray-300">{formatTime(bookmark.timestamp)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          
          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={[videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(videoDuration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={skipBackward}
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={skipForward}
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  className="w-20"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBookmarkTime(currentTime)
                  setShowBookmarkDialog(true)
                }}
                className="text-white hover:bg-white/20"
              >
                <Bookmark className="h-4 w-4" />
              </Button>

              <select
                value={playbackRate}
                onChange={(e) => changePlaybackRate(Number(e.target.value))}
                className="bg-transparent text-white text-sm border border-white/20 rounded px-2 py-1"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmark Dialog */}
      {showBookmarkDialog && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Bookmark</h3>
            <p className="text-sm text-gray-600 mb-4">
              Bookmark at {formatTime(bookmarkTime)}
            </p>
            <input
              type="text"
              placeholder="Bookmark title"
              className="w-full p-2 border rounded mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const title = (e.target as HTMLInputElement).value
                  if (title.trim()) {
                    addBookmark(title.trim())
                    setShowBookmarkDialog(false)
                  }
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowBookmarkDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement
                  const title = input?.value?.trim()
                  if (title) {
                    addBookmark(title)
                    setShowBookmarkDialog(false)
                  }
                }}
              >
                Add Bookmark
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}