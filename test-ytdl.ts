import ytdl from "@distube/ytdl-core";

async function main() {
    const url = "https://youtu.be/j3Rf0DqQoR0";
    const info = await ytdl.getInfo(url);

    const vna = ytdl.filterFormats(info.formats, "videoandaudio");
    console.log("videoandaudio items:", vna.length);
    if (vna.length > 0) {
        console.log("Sample videoandaudio format keys:");
        console.log(vna[0]);
    }

    const vo = ytdl.filterFormats(info.formats, "videoonly");
    console.log("videoonly items:", vo.length);
    if (vo.length > 0) {
        console.log("Sample videoonly format:");
        console.log({ itag: vo[0].itag, hasAudio: vo[0].hasAudio, hasVideo: vo[0].hasVideo });
    }
}

main().catch(console.error);
