interface UploadStrategy {
    upload(data: any): Promise<{ filePath: string; format?: string; duration?: number }>;
}

class UrlUploadStrategy implements UploadStrategy {

    async upload(data: { url: string; title: string }): Promise<{ filePath: string; format?: string; duration?: number }> {

        const downloadsDir = path.join(process.cwd(), "downloads", "music");

        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
        }

        const fileName = `${Date.now()}-${data.title.replace(/\s+/g, "_")}.mp4`;
        const filePath = path.join(downloadsDir, fileName);

        try {
            const response = await fetch(data.url);
            if (!response.ok) {
                throw new Error(`Failed to download: ${response.statusText}`);
            }

            const buffer = await response.arrayBuffer();
            fs.writeFileSync(filePath, Buffer.from(buffer));

            return {
                filePath,
                format: "mp4",
            };

        } catch (error) {
            throw new Error(`Failed to download file: ${error.message}`);
        }
    }

}

class FileUploadStrategy implements UploadStrategy {
    async upload(data: { filePath: string; fileName: string }): Promise<{ filePath: string; format?: string; duration?: number }> {

        // Handle file upload from local downloads folder
        const sourceFile = data.filePath;

        if (!fs.existsSync(sourceFile)) {
            throw new Error(`Source file not found: ${sourceFile}`);
        }

        const musicDir = path.join(process.cwd(), "downloads", "music");

        if (!fs.existsSync(musicDir)) {
            fs.mkdirSync(musicDir, { recursive: true });
        }

        const fileName = `${Date.now()}-${data.fileName}`;
        const destPath = path.join(musicDir, fileName);

        // Copy file to music directory
        fs.copyFileSync(sourceFile, destPath);

        const ext = path.extname(fileName).slice(1);

        return {
            filePath: destPath,
            format: ext || "unknown",
        };
    }
}
