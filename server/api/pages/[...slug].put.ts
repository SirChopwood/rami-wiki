// server/api/pages/[...slug].put.ts
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import {pages, pageRevisions} from "#server/database/schema/wikiPages.ts";
import {drizzle} from "drizzle-orm/d1";

const updatePageSchema = z.object({
    title: z.string().min(1).max(200),
    content: z.string(),
    editSummary: z.string().max(300).optional(),
})

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event) // Your existing auth helper
    const slug = getRouterParam(event, 'slug')
    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: 'Page slug is required' })
    }

    const body = await readValidatedBody(event, updatePageSchema.parse)
    const db = drizzle(event.context.cloudflare.env.rami_wiki_db)

    const existing = await db.select().from(pages).where(eq(pages.slug, slug)).get()

    if (!existing) {
        throw createError({ statusCode: 404, statusMessage: 'Page not found' })
    }

    const now = new Date()

    const [updated] = await db
        .update(pages)
        .set({
            title: body.title,
            content: body.content,
            updatedBy: session.user.id,
            updatedAt: now,
        })
        .where(eq(pages.id, existing.id))
        .returning()

    await db.insert(pageRevisions).values({
        pageId: existing.id,
        title: body.title,
        content: body.content,
        editSummary: body.editSummary ?? 'Updated page content',
        authorId: session.user.id,
        createdAt: now,
    })

    return updated
})