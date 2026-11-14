import {drizzle} from "drizzle-orm/d1";
import { users } from "#server/database/schema/userManagement.ts";
import {eq} from "drizzle-orm";
import { updateSessionUser } from "#server/utils/auth.ts";


export default defineOAuthSteamEventHandler({
    async onSuccess(event, { user }) {
        const db = drizzle(event.context.cloudflare.env.rami_wiki_db)
        let resultAccount

        // If user is logged in, link accounts.
        const session = await getUserSession(event)
        if (session.user?.id) {
            resultAccount = await db.update(users).set({
                steam_id: user.steamid,
                steam_username: user.personaname,
                steam_avatar: user.avatarfull,
            }).where(eq(users.id, session.user!.id)).returning().get()
            return await updateSessionUser(event, resultAccount)
        }

        // If account (logged in or out) already linked, update info.
        let existingAccount = await db.select().from(users).where(
            eq(users.steam_id, user.steamid)
        ).get()
        if (existingAccount) {
            resultAccount = await db.update(users).set({
                steam_username: user.personaname,
                steam_avatar: user.avatarfull,
            }).where(eq(users.steam_id, user.steamid)).returning().get()
            return await updateSessionUser(event, resultAccount)
        }

        // No account found, create a new one
        resultAccount = await db.insert(users).values({
            steam_id: user.steamid,
            steam_username: user.personaname,
            steam_avatar: user.avatarfull
        }).returning().get()
        return await updateSessionUser(event, resultAccount)
    },
    onError(event, error) {
        console.error('Steam Auth Error:', error)
        return sendRedirect(event, '/?error=auth_failed')
    }
})