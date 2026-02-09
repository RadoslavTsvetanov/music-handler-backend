import type z from "zod/v4";
import { songSchema } from "../../schema";
import type { OptionalPromise, TypeSafeOmit } from "@blazyts/better-standard-library";
import type { Song } from "../../types";

type SongQuery = {
    name: {is: string} | {contains: string}
    tags: {hasTagOfType?: string, valueOfTagIs?: string}
    author: string
}

export interface IRepo {
    createSong(song:  TypeSafeOmit<z.infer<typeof songSchema>, "audioHash">): Promise<void>
    get(query: SongQuery): OptionalPromise<Song[]>
    getUsingAi(prompt: string): OptionalPromise<Song[]>
    getAll(): OptionalPromise<Song[]>
}