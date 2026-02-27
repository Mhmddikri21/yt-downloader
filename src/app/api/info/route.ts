import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url || !ytdl.validateURL(url)) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(url);
    
    // Group formats
    const videoFormats = ytdl.filterFormats(info.formats, "videoandaudio").map(f => ({
      itag: f.itag,
      qualityLabel: f.qualityLabel,
      container: f.container,
      hasAudio: f.hasAudio,
      hasVideo: f.hasVideo,
      contentLength: f.contentLength
    }));

    const videoOnlyFormats = ytdl.filterFormats(info.formats, "videoonly").map(f => ({
      itag: f.itag,
      qualityLabel: f.qualityLabel,
      container: f.container,
      hasAudio: f.hasAudio,
      hasVideo: f.hasVideo,
      contentLength: f.contentLength
    }));

    const audioOnlyFormats = ytdl.filterFormats(info.formats, "audioonly").map(f => ({
      itag: f.itag,
      audioBitrate: f.audioBitrate,
      container: f.container,
      hasAudio: f.hasAudio,
      hasVideo: f.hasVideo,
      contentLength: f.contentLength
    }));

    return NextResponse.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]?.url,
      author: info.videoDetails.author.name,
      lengthSeconds: info.videoDetails.lengthSeconds,
      formats: {
        videoWithAudio: videoFormats,
        videoOnly: videoOnlyFormats,
        audioOnly: audioOnlyFormats,
      }
    });
  } catch (error: any) {
    console.error("Error fetching video info:", error);
    return NextResponse.json({ error: "Failed to fetch video information" }, { status: 500 });
  }
}
