// src/components/SurahVideoPlayer.jsx
import React, { useState, useEffect } from 'react';
import { getSurahVideoUrl, isVideoDownloaded, markVideoAsViewed } from '../utils/videoPaths';

function SurahVideoPlayer({ surahNumber, surahName }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [isViewed, setIsViewed] = useState(false);

  useEffect(() => {
    setIsViewed(isVideoDownloaded(surahNumber));
    setVideoUrl(getSurahVideoUrl(surahNumber));
  }, [surahNumber]);

  const handlePlay = () => {
    if (!videoUrl) return alert('عذراً، الفيديو غير متاح');
    if (!isViewed) markVideoAsViewed(surahNumber, surahName);
    window.location.href = videoUrl;
  };

  return (
    <button
      className={`icon-btn video-btn ${isViewed ? 'viewed' : 'new'}`}
      onClick={handlePlay}
      title={`تلاوة ${surahName}`}
    >
      <span className="icon">🎬</span>
    </button>
  );
}

export default SurahVideoPlayer;