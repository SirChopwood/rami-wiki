import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    role_id: integer('role_id').notNull().default(0),

    // DISCORD OAUTH
    discord_id: text('discord_id'),
    discord_username: text('discord_username'),
    discord_avatar: text('discord_avatar'),

    // STEAM OAUTH
    steam_id: text('steam_id'),
    steam_username: text('steam_username'),
    steam_avatar: text('steam_avatar'),
})

export const roles = sqliteTable('roles', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    colour: text('colour').notNull().default('#ffffff'),
    permissions: text('permissions', { mode: 'json' }).$type<string[]>().notNull().default(['read:wiki']),
})