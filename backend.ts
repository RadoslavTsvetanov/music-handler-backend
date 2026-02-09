import { Blazy } from "../../../backend-framework/core/blazy-edge/src/core";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { exec } from "node:child_process";
import { title } from "node:process";
import { OneOf } from "@blazyts/better-standard-library/src/data_structures/functional-patterns/one-of";

const execAsync = promisify(exec);

const MusicOrigin = OneOf([Spotify, Device, TikTok, Youtube])

type Music = {
    title: string;
    content: {
        bucketLink: string,
        origin: 
    };
    tags: JSON
};

const musicDatabase: Music[] = [];

const app = new Blazy();



app.getAll({
    handler: arg => musicDatabase.map(m => ({
    })),
    args: {
        type: "files" | "links",
    }
})
.post({
    path: "/music/:id",
    handeler: args => {

        const music = musicDatabase.find(m => m.id === args.id);

        if (!music) {
            throw new Error("Music not found");
        }

        return music;

    },
    args: { id: "" }
});

app.post({
    path: "",
    handeler: async args => {
        const { url, title, artist } = args.body;

        try {
            const strategy = uploadStrategies.url;
            const result = await strategy.upload({ url, title });

            const music: Music = {
                id: Math.random().toString(36).substr(2, 9),
                title,
                artist,
                filePath: result.filePath,
                uploadStrategy: "url",
                createdAt: new Date(),
                format: result.format,
                duration: result.duration,
            };

            musicDatabase.push(music);

            return {
                success: true,
                music: {
                    id: music.id,
                    title: music.title,
                    artist: music.artist,
                    uploadStrategy: music.uploadStrategy,
                    createdAt: music.createdAt,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    },
    args:
    {
        body: {

            url: "",
            title: "",
            artist: ""
        }
    }
},
)

// Upload music from local file
app.fromNormalFunc("uploadMusicFromFile", async (args: { body: { filePath: string; fileName: string; title: string; artist: string } }) => {

    const { filePath, fileName, title, artist } = args.body;

    try {
        const strategy = uploadStrategies.file;
        const result = await strategy.upload({ filePath, fileName });

        const music: Music = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            artist,
            filePath: result.filePath,
            uploadStrategy: "file",
            createdAt: new Date(),
            format: result.format,
            duration: result.duration,
        };

        musicDatabase.push(music);

        return {
            success: true,
            music: {
                id: music.id,
                title: music.title,
                artist: music.artist,
                uploadStrategy: music.uploadStrategy,
                createdAt: music.createdAt,
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
});

// Delete music
app.fromNormalFunc("deleteMusic", (args: { body: { id: string } }) => {
    const index = musicDatabase.findIndex(m => m.id === args.body.id);

    if (index === -1) {
        throw new Error("Music not found");
    }

    const music = musicDatabase[index];

    // Delete file from filesystem
    if (fs.existsSync(music.filePath)) {
        fs.unlinkSync(music.filePath);
    }

    musicDatabase.splice(index, 1);

    return {
        success: true,
        message: "Music deleted successfully",
    };
});

// Update music metadata
app.fromNormalFunc("updateMusic", (args: { body: { id: string; title?: string; artist?: string } }) => {
    const music = musicDatabase.find(m => m.id === args.body.id);

    if (!music) {
        throw new Error("Music not found");
    }

    if (args.body.title) {
        music.title = args.body.title;
    }

    if (args.body.artist) {
        music.artist = args.body.artist;
    }

    return {
        success: true,
        music: {
            id: music.id,
            title: music.title,
            artist: music.artist,
            uploadStrategy: music.uploadStrategy,
            createdAt: music.createdAt,
        },
    };
});

// Export the app
export default app;
export { app, musicDatabase };
