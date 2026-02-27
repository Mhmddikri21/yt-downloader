const ytdl = require("@distube/ytdl-core");

async function main() {
    const url = "https://youtu.be/j3Rf0DqQoR0";
    const info = await ytdl.getInfo(url);

    const getUniqueFormats = (formats, key) => {
        const map = new Map();
        formats.forEach((f) => {
            const val = f[key];
            if (!val) return;
            if (!map.has(val)) {
                map.set(val, f);
            } else {
                const existing = map.get(val);
                if (!existing.hasAudio && f.hasAudio) {
                    map.set(val, f);
                } else if (existing.hasAudio === f.hasAudio) {
                    if (existing.container === "webm" && (f.container === "mp4" || f.container === "m4a")) {
                        map.set(val, f);
                    }
                }
            }
        });
        return Array.from(map.values()).sort((a, b) => {
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
            hasAudio: f.hasAudio || false,
            hasVideo: f.hasVideo || false,
        })),
        "qualityLabel"
    );

    console.log(JSON.stringify(videoFormats, null, 2));
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
