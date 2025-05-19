"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
  videoKey: string;
}

const VideoPlayer = ({ videoKey }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (error) {
    return (
      <div className="flex items-center justify-center bg-black aspect-video">
        <div className="text-white text-center p-4">
          <p>{error}</p>
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
        poster={`https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/${videoKey.replace('.mp4', '-poster.jpg')}`}
      >
        <source
          src={`https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/${videoKey}`}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
