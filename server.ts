import { app } from "../music/app/backend/backend";

const PORT = process.env.PORT || 3000;

console.log(`🎵 Music Handler Server starting on port ${PORT}...`);
console.log(`\nAvailable RPC endpoints:`);
console.log(`  POST /rpc/getAllMusic - Get all music`);
console.log(`  POST /rpc/getMusicById - Get music by ID`);
console.log(`  POST /rpc/uploadMusicFromUrl - Upload music from URL`);
console.log(`  POST /rpc/uploadMusicFromFile - Upload music from file`);
console.log(`  POST /rpc/deleteMusic - Delete music`);
console.log(`  POST /rpc/updateMusic - Update music metadata`);
console.log(`\nServer ready! 🚀\n`);
