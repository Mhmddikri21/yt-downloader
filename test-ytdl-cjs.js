const ytdl = require("@distube/ytdl-core");

async function main() {
    const url = "https://youtu.be/j3Rf0DqQoR0";
    const info = await ytdl.getInfo(url);

    const vna = ytdl.filterFormats(info.formats, "videoandaudio");
    console.log("videoandaudio items:", vna.length);
    if (vna.length > 0) {
        console.log("Sample videoandaudio format keys:");
        console.log(vna.map(v => ({ q: v.qualityLabel, hasA: v.hasAudio, hasV: v.hasVideo, c: v.container })));
    }

    const vo = ytdl.filterFormats(info.formats, "videoonly");
    console.log("videoonly items:", vo.length);
    if (vo.length > 0) {
        console.log("Sample videoonly format:");
        console.log(vo.map(v => ({ q: v.qualityLabel, hasA: v.hasAudio, hasV: v.hasVideo, c: v.container })).slice(0, 3));
    }
}

main().catch(console.error);
