import z from "zod/v4"
import * as schemma from "../schema"
export type Song = z.infer<typeof schemma.songSchema>
export type Tag = z.infer<typeof schemma.tagSchema>
export type DbScehma = z.infer<typeof schemma.schema>