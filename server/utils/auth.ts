import type { H3Event } from 'h3'
import { drizzle } from 'drizzle-orm/d1'
import { roles } from "#server/database/schema/userManagement.ts";
import { eq } from 'drizzle-orm'
import type {User} from "#auth-utils";

export const requirePermission = async (event: H3Event, requiredPermission: string) => {
    const session = await requireUserSession(event)

    if (session.user.role_id) {
        const db = drizzle(event.context.cloudflare.env.rami_wiki_db)
        const role = await db.select().from(roles).where(eq(roles.id, session.user.role_id)).get()

        if (role && role.permissions.includes(requiredPermission)) {
            return session.user
        }
    }

    throw createError({
        statusCode: 403,
        statusMessage: `You are missing the ${requiredPermission} permission to perform this action.`
    })
}

export async function updateSessionUser(event: any, user: User) {
    await setUserSession(event, {
        user: user
    })
    return sendRedirect(event, '/')
}