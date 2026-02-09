import z from "zod/v4";
import { tagSchema } from "./tag";

export const songSchema = z.object({
    name: z.string().nonempty(),
    author: z.string().nonempty(),
    tags: z.array(tagSchema),
    audioHash: z.string()
})