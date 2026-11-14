// server/api/pages/[...slug].get.ts
import { eq } from 'drizzle-orm'
import {drizzle} from "drizzle-orm/d1";
import {pages} from "#server/database/schema/wikiPages.ts";

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')
    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: 'Page slug is required' })
    }

    const db = drizzle(event.context.cloudflare.env.rami_wiki_db)
    const page = await db.select().from(pages).where(eq(pages.slug, slug)).get()

    if (!page) {
        throw createError({ statusCode: 404, statusMessage: 'Page not found' })
    }

    return page
})