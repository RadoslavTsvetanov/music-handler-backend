import { type TypeSafeOmit, type OptionalPromise, TypeMarker  } from "@blazyts/better-standard-library";
import type { output } from "zod";
import { schema, songSchema } from "../../schema";
import type { Song } from "../../types";
import type { IRepo } from "../types/interface";
import { JsonOrm, JsonOrmFactory } from "@blazyts/json-orm"


class Is extends TypeMarker<"Is"> {
    constructor(public value: string) {
        super("Is")
    }
}

class Contains extends TypeMarker<"Contains"> {
    constructor(public value: string) {
        super("Contains")
    }
}

// class NameQuery extends OneOf([Is, Contains])<unknown> { }


function handleQuery(nameQuery: NameQuery) {
    nameQuery.defineHandlers({

    })
}


export class JsonRepo implements IRepo {
    private readonly client = JsonOrmFactory.normal(schema)

    constructor() {

    }

    async createSong(song: TypeSafeOmit<output<typeof songSchema>, "audioHash">): Promise<Song> {
        const audioHash = this.generateAudioHash();
        const newSong = {
            ...song,
            audioHash
        };
        await this.client.transact(v => v.songs.push(newSong));
        return newSong;
    }

    async get(query: {
        name?: { is: string; } | { contains: string; };
        tags?: { hasTagOfType?: string; valueOfTagIs?: string; };
        author: string;
    }): OptionalPromise<Song[]> {
        const allSongs = (await this.client.getContent()).songs
        let songsMatchingFilters = allSongs
        // applying the filters one after another since they are inclusive, support for or syntax in the future
        if (query.name) {
            if ('is' in query.name && 'contains' in query.name) {
                throw new Error("cant use both params // make it into a result into the future ")
            }
            if ('is' in query.name) {
                songsMatchingFilters = songsMatchingFilters.filter(song => song.name === query.name.is)
            }
            if ('contains' in query.name) {
                songsMatchingFilters = songsMatchingFilters.filter(song => song.name.includes(query.name.contains))
            }
        }

        if (query.tags) {
            if (query.tags.hasTagOfType) {
                songsMatchingFilters = songsMatchingFilters.filter(song =>
                    song.tags.some(tag => tag.type === query.tags.hasTagOfType)
                )
            }
            if (query.tags.valueOfTagIs) {
                songsMatchingFilters = songsMatchingFilters.filter(song =>
                    song.tags.some(tag => tag.value === query.tags.valueOfTagIs)
                )
            }
        }

        if (query.author) {
            songsMatchingFilters = songsMatchingFilters.filter(song => song.author === query.author)
        }

        return songsMatchingFilters
    }

    getUsingAi(prompt: string): OptionalPromise<Song[]> {
        throw new Error("AI-based song retrieval not implemented. Consider integrating an AI service.");
    }

    async getAll(): OptionalPromise<Song[]> {
        return (await this.client.getContent()).songs
    }

    private generateAudioHash(): string {
        return `hash_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }




}

new JsonRepo().createSong({
    author: "drok",
    linkToBucket: "",
    name: "dd",
    tags: []
})