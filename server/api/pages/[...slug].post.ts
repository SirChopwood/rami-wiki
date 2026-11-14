// server/api/pages/index.post.ts
import { z } from 'zod'
import {pages, pageRevisions} from "#server/database/schema/wikiPages.ts";
import {drizzle} from "drizzle-orm/d1";

const createPageSchema = z.object({
    slug: z
        .string()
        .min(1)
        .max(200)
        .regex(/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/, 'Invalid URL slug'),
    title: z.string().min(1).max(200),
    content: z.string().default(''),
})

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event)
    const body = await readValidatedBody(event, createPageSchema.parse)
    const db = drizzle(event.context.cloudflare.env.rami_wiki_db)
    const now = new Date()

    const [created] = await db
        .insert(pages)
        .values({
            slug: body.slug,
            title: body.title,
            content: body.content,
            authorId: session.user.id,
            updatedBy: session.user.id,
            createdAt: now,
            updatedAt: now,
        })
        .returning()

    if (!created) throw createError({
        statusCode: 400,
        statusMessage: 'Failed to create page.'
    })

    await db.insert(pageRevisions).values({
        pageId: created.id,
        title: created.title,
        content: created.content,
        editSummary: 'Initial page creation',
        authorId: session.user.id,
        createdAt: now,
    })

    setResponseStatus(event, 201)
    return created
})