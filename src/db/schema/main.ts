import z from "zod/v4";
import { songSchema } from "./song";

export const schema = z.object({
    songs: z.array(songSchema)
})