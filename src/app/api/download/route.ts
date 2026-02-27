import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";
import { Readable } from "stream";

function nodeStreamToWebStream(nodeStream: Readable) {
    return new ReadableStream({
        start(controller) {
            nodeStream.on("data", (chunk) => {
                controller.enqueue(new Uint8Array(chunk));
            });
            nodeStream.on("end", () => {
                controller.close();
            });
            nodeStream.on("error", (err) => {
                controller.error(err);
            });
        },
        cancel() {
            nodeStream.destroy();
        },
    });
}

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");
    const itag = req.nextUrl.searchParams.get("itag");
    const type = req.nextUrl.searchParams.get("type") || "video";

    if (!url || !ytdl.validateURL(url) || !itag) {
        return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: itag });

        if (!format) {
            return NextResponse.json({ error: "Requested format not found" }, { status: 404 });
        }

        const stream = ytdl(url, { format: format });
        const webStream = nodeStreamToWebStream(stream);

        // Sanitize filename
        const title = info.videoDetails.title.replace(/[^a-zA-Z0-9]/g, "_");
        const ext = format.container || (type === "audio" ? "mp3" : "mp4");
        const filename = `${title}.${ext}`;

        const headers = new Headers();
        headers.set("Content-Disposition", `attachment; filename="${filename}"`);
        headers.set("Content-Type", type === "audio" ? "audio/mpeg" : "video/mp4");

        if (format.contentLength) {
            headers.set("Content-Length", format.contentLength);
        }

        return new NextResponse(webStream, {
            status: 200,
            headers,
        });
    } catch (error: any) {
        console.error("Download Error:", error);
        return NextResponse.json({ error: "Error during download process" }, { status: 500 });
    }
}
