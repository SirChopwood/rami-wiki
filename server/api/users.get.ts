import { drizzle } from 'drizzle-orm/d1'
import { users } from "#server/database/schema.ts";

export default defineEventHandler(async (event) => {
    const db = drizzle(event.context.cloudflare.env.rami_wiki_db)
    return db.select().from(users).all();
})