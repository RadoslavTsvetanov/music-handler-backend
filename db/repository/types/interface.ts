import type z from "zod/v4";
import { songSchema } from "../../schema";


export interface IRepo {
    createSong(song:  z.infer<typeof songSchema>): Promise<void>
    
}