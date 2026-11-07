import { drizzle } from 'drizzle-orm/d1'
import { users } from "#server/database/schema.ts";
import { eq } from 'drizzle-orm'
import { updateSessionUser } from "#server/utils/auth.ts";

export default defineOAuthDiscordEventHandler({
    config: {
        emailRequired: true,
    },
    async onSuccess(event, { user: discordUser }) {
        const db = drizzle(event.context.cloudflare.env.rami_wiki_db)
        let resultAccount

        // If user is logged in, link accounts.
        const session = await getUserSession(event)
        if (session.user?.id) {
            resultAccount = await db.update(users).set({
                discord_id: discordUser.id,
                discord_username: discordUser.global_name || discordUser.username,
                discord_avatar: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`,
            }).where(eq(users.id, session.user!.id)).returning().get()
            return await updateSessionUser(event, resultAccount)

        }

        // If account (logged in or out) already linked, update info.
        let existingAccount = await db.select().from(users).where(
            eq(users.discord_id, discordUser.id)
        ).get()
        if (existingAccount) {
            resultAccount = await db.update(users).set({
                discord_username: discordUser.global_name || discordUser.username,
                discord_avatar: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            }).where(eq(users.discord_id, discordUser.id)).returning().get()
            return await updateSessionUser(event, resultAccount)

        }

        // No account found, create a new one
        resultAccount = await db.insert(users).values({
            discord_id: discordUser.id,
            discord_username: discordUser.global_name || discordUser.username,
            discord_avatar: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        }).returning().get()
        return await updateSessionUser(event, resultAccount)
    },
    onError(event, error) {
        console.error('Discord OAuth error:', error)
        return sendRedirect(event, '/?error=auth_failed')
    }
})

