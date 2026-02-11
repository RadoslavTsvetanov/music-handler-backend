import z from "zod/v4";
import { tagSchema } from "./tag";

export const songSchema = z.object({
    name: z.string().nonempty(),
    author: z.string().nonempty(),
    tags: z.array(tagSchema),
    linkToBucket: z.string().nonempty(),
    audioHash: z.string()
})