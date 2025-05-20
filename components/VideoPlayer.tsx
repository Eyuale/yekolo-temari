"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

// Get the CloudFront domain from environment variable or use a fallback
const CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN || "https://d3s6rof93odmrh.cloudfront.net";

// Log the CloudFront domain for debugging
console.log("CloudFront Domain:", CLOUDFRONT_DOMAIN);

interface VideoPlayerProps {
  videoKey: string;
}

const VideoPlayer = ({ videoKey }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVideoKeyValid] = useState(!!videoKey);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedData = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setError("Failed to load video. Please try again later.");
    };

    videoElement.addEventListener("loadeddata", handleLoadedData);
    videoElement.addEventListener("error", handleError);

    return () => {
      videoElement.removeEventListener("loadeddata", handleLoadedData);
      videoElement.removeEventListener("error", handleError);
    };
  }, []);

  if (error || !isVideoKeyValid) {
    return (
      <div className="flex items-center justify-center bg-black aspect-video">
        <div className="text-white text-center p-4">
          <p>{error || "Video not available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black aspect-video">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        preload="auto"
        poster={`${CLOUDFRONT_DOMAIN}/${videoKey.replace('.mp4', '-poster.jpg')}`}
      >
        <source
          src={`${CLOUDFRONT_DOMAIN}/${videoKey}`}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
