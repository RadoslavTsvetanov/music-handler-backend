import type z from "zod/v4";
import { songSchema } from "../../schema";
import type { TypeSafeOmit } from "@blazyts/better-standard-library";

type SongQuery = {
    name: {is: string} | {contains: string}
    tags: {hasTagOfType?: string, valueOfTagIs?: string}
    author: string
}

export interface IRepo {
    createSong(song:  TypeSafeOmit<z.infer<typeof songSchema>, "audioHash">): Promise<void>
    get(query: SongQuery): Promise<>
    getUsingAi(prompt: string)
    getAll()
}