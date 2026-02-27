"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, Loader2, Music, Video, Youtube, CheckCircle2 } from "lucide-react";
import axios from "axios";

type Format = {
  itag: number;
  qualityLabel?: string;
  audioBitrate?: number;
  container: string;
  hasAudio: boolean;
  hasVideo: boolean;
  contentLength?: string;
};

type VideoInfo = {
  title: string;
  thumbnail: string;
  author: string;
  lengthSeconds: string;
  formats: {
    videoWithAudio: Format[];
    videoOnly: Format[];
    audioOnly: Format[];
  };
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);
  const [activeTab, setActiveTab] = useState<"video" | "audio">("video");
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchVideoInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    setError(null);
    setVideoInfo(null);
    setSelectedFormat(null);

    try {
      const res = await axios.get(`/api/info?url=${encodeURIComponent(url)}`);
      setVideoInfo(res.data);
      if (res.data.formats.videoWithAudio.length > 0) {
        setSelectedFormat(res.data.formats.videoWithAudio[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch video information. Make sure the URL is valid.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!videoInfo || !selectedFormat) return;

    setIsDownloading(true);

    // Create an invisible iframe to trigger the download or use window.location
    const type = activeTab === "audio" ? "audio" : "video";
    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&itag=${selectedFormat.itag}&type=${type}`;

    // This allows the browser to handle the file attachment stream directly
    window.location.href = downloadUrl;

    // Reset download state after a brief delay
    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };

  const formatBytes = (bytes?: string) => {
    if (!bytes) return "Unknown size";
    const b = parseInt(bytes, 10);
    if (b < 1024) return b + " B";
    if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
    return (b / 1048576).toFixed(1) + " MB";
  };

  const formatDuration = (seconds: string) => {
    const s = parseInt(seconds, 10);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const remainingS = s % 60;
    const remainingM = m % 60;

    if (h > 0) return `${h}:${remainingM.toString().padStart(2, "0")}:${remainingS.toString().padStart(2, "0")}`;
    return `${remainingM}:${remainingS.toString().padStart(2, "0")}`;
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden bg-neutral-950">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl z-10 space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.3)]"
          >
            <Youtube className="w-10 h-10 text-rose-500" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            YT <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">Downloader</span>
          </h1>
          <p className="text-neutral-400 text-lg sm:text-xl font-medium max-w-lg mx-auto">
            Download your favorite YouTube videos in high quality, blazing fast.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={fetchVideoInfo} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
          <div className="relative flex items-center bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden focus-within:border-rose-500/50 transition-colors">
            <Search className="w-6 h-6 text-neutral-500 ml-4 hidden sm:block" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube link here..."
              className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 sm:py-4 placeholder:text-neutral-600 text-base sm:text-lg focus:ring-0"
              spellCheck={false}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={isLoading || !url}
              className="bg-white text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-all hover:bg-neutral-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 relative overflow-hidden group/btn"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Fetch"}
              </span>
            </button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl text-center text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          {videoInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Video Preview */}
              <div className="flex flex-col sm:flex-row gap-6 p-6 border-b border-white/5">
                <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden shrink-0 group">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-md max-w-max z-20">
                    {formatDuration(videoInfo.lengthSeconds)}
                  </div>
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 line-clamp-2 leading-tight">
                    {videoInfo.title}
                  </h3>
                  <p className="text-neutral-400 font-medium flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs">
                      {videoInfo.author.charAt(0)}
                    </span>
                    {videoInfo.author}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="p-6 space-y-6">
                {/* Tabs */}
                <div className="flex p-1 bg-neutral-950/50 rounded-xl">
                  <button
                    onClick={() => {
                      setActiveTab("video");
                      setSelectedFormat(videoInfo.formats.videoWithAudio[0]);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${activeTab === "video"
                      ? "bg-neutral-800 text-white shadow-sm"
                      : "text-neutral-500 hover:text-white"
                      }`}
                  >
                    <Video className="w-5 h-5" /> Video
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("audio");
                      setSelectedFormat(videoInfo.formats.audioOnly[0]);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${activeTab === "audio"
                      ? "bg-neutral-800 text-white shadow-sm"
                      : "text-neutral-500 hover:text-white"
                      }`}
                  >
                    <Music className="w-5 h-5" /> Audio Only
                  </button>
                </div>

                {/* Format selection grids */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2 pb-2">
                  {activeTab === "video"
                    ? videoInfo.formats.videoWithAudio.map((format) => (
                      <button
                        key={format.itag}
                        onClick={() => setSelectedFormat(format)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${selectedFormat?.itag === format.itag
                          ? "bg-rose-500/10 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
                          : "bg-neutral-900 border-white/5 hover:border-white/20 hover:bg-neutral-800"
                          }`}
                      >
                        <span className={`font-bold text-lg mb-1 flex items-center gap-1 ${selectedFormat?.itag === format.itag ? 'text-rose-400' : 'text-white'}`}>
                          {format.qualityLabel || "Unknown"}
                          {!format.hasAudio && (
                            <span title="No Audio" className="bg-orange-500/20 text-orange-400 text-[10px] px-1.5 py-0.5 rounded-sm font-bold ml-1">
                              MUTE
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-neutral-500 font-medium text-center">
                          {format.container.toUpperCase()} • {formatBytes(format.contentLength)}
                        </span>
                      </button>
                    ))
                    : videoInfo.formats.audioOnly.map((format) => (
                      <button
                        key={format.itag}
                        onClick={() => setSelectedFormat(format)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${selectedFormat?.itag === format.itag
                          ? "bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                          : "bg-neutral-900 border-white/5 hover:border-white/20 hover:bg-neutral-800"
                          }`}
                      >
                        <span className={`font-bold text-lg mb-1 ${selectedFormat?.itag === format.itag ? 'text-indigo-400' : 'text-white'}`}>
                          {format.audioBitrate} kbps
                        </span>
                        <span className="text-xs text-neutral-500 font-medium">
                          {format.container.toUpperCase()} • {formatBytes(format.contentLength)}
                        </span>
                      </button>
                    ))
                  }
                </div>

                {/* Download Action */}
                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={handleDownload}
                    disabled={!selectedFormat || isDownloading}
                    className="w-full relative group overflow-hidden bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] shadow-[0_0_40px_rgba(244,63,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-6 h-6" />
                        Download {activeTab === "video" ? selectedFormat?.qualityLabel : `${selectedFormat?.audioBitrate}kbps`}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
