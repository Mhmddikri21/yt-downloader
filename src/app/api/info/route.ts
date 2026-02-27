import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url || !ytdl.validateURL(url)) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    const info = await ytdl.getInfo(url);

    // Helper to get unique formats, preferring mp4 over webm
    const getUniqueFormats = (formats: any[], key: "qualityLabel" | "audioBitrate") => {
      const map = new Map<string | number, any>();

      formats.forEach((f) => {
        const val = f[key];
        if (!val) return;

        if (!map.has(val)) {
          map.set(val, f);
        } else {
          const existing = map.get(val);

          // Rule 1: Always prefer format WITH audio over format WITHOUT audio
          if (!existing.hasAudio && f.hasAudio) {
            map.set(val, f);
          }
          // Rule 2: If both have (or both lack) audio, prefer mp4/m4a over webm
          else if (existing.hasAudio === f.hasAudio) {
            if (existing.container === "webm" && (f.container === "mp4" || f.container === "m4a")) {
              map.set(val, f);
            }
          }
        }
      });

      // Sort by best quality first
      return Array.from(map.values()).sort((a, b) => {
        if (key === "audioBitrate") return (b.audioBitrate || 0) - (a.audioBitrate || 0);
        // Basic sort for qualityLabel (e.g. 1080p > 720p)
        const aRes = parseInt(a.qualityLabel || "0");
        const bRes = parseInt(b.qualityLabel || "0");
        return bRes - aRes;
      });
    };

    const videoFormats = getUniqueFormats(
      [
        ...ytdl.filterFormats(info.formats, "videoandaudio"),
        ...ytdl.filterFormats(info.formats, "videoonly")
      ].map(f => ({
        itag: f.itag,
        qualityLabel: f.qualityLabel,
        container: f.container,
        hasAudio: f.hasAudio,
        hasVideo: f.hasVideo,
        contentLength: f.contentLength
      })),
      "qualityLabel" // This now neatly deduplicates based on resolution, preferring those with audio if duplicates exist due to the sorting later on or we can just let `getUniqueFormats` handle it
    ).sort((a, b) => {
      // Prioritize formats with audio if they have the same quality
      if (a.qualityLabel === b.qualityLabel) {
        return (a.hasAudio === b.hasAudio) ? 0 : a.hasAudio ? -1 : 1;
      }
      return 0;
    });

    // We no longer strictly need a separate videoOnly array sent to the frontend if we merge them
    const videoOnlyFormats: any[] = [];

    const audioOnlyFormats = getUniqueFormats(
      ytdl.filterFormats(info.formats, "audioonly").map(f => ({
        itag: f.itag,
        audioBitrate: f.audioBitrate,
        container: f.container,
        hasAudio: f.hasAudio,
        hasVideo: f.hasVideo,
        contentLength: f.contentLength
      })),
      "audioBitrate"
    );

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
