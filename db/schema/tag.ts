import z from "zod/v4";

export const tagSchema = z.object({
    type: z.string(),
    value: z.string().nonempty()
})