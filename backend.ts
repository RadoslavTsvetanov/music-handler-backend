import { Blazy } from "../../../backend-framework/core/blazy-edge/src/core";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { exec } from "node:child_process";
import { title } from "node:process";
import { OneOf } from "@blazyts/better-standard-library/src/data_structures/functional-patterns/one-of";
import { JsonRepo } from "./db/repository/variations/json";
import z from "zod/v4";
import { songSchema, tagSchema } from "./db/schema";
import {Without} from "@blazyts/zod-utils"
const execAsync = promisify(exec);

// const MusicOrigin = OneOf([Spotify, Device, TikTok, Youtube])



const app = new Blazy();

const repo = new JsonRepo()

app
.getAll({
    handler: async () => await (new JsonRepo()).getAll()
})
.post({
    handeler: args => {

        const music = repo.createSong(args) 

        if (!music) {
            throw new Error("Music not found");
        }

        return music;

    },
    args: Without(songSchema, ["audioHash", "linkToBucket"])
})