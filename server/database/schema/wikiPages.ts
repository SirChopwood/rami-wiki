// server/database/schema.ts
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
// Import your existing users table if linking authors:
// import { users } from './users'

export const pages = sqliteTable(
    'pages',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        // Supports nested paths like "guides/getting-started"
        slug: text('slug').notNull().unique(),
        title: text('title').notNull(),
        // Stores standard Markdown + `::component-name{...}` MDC blocks
        content: text('content').notNull().default(''),
        summary: text('summary'),
        isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
        authorId: text('author_id'),
        updatedBy: text('updated_by'),
        createdAt: integer('created_at', { mode: 'timestamp' })
            .notNull()
            .$defaultFn(() => new Date()),
        updatedAt: integer('updated_at', { mode: 'timestamp' })
            .notNull()
            .$defaultFn(() => new Date()),
        colours: text('colours', { mode: 'json' }).$type<{
                background: string,
                accent: string,
                header: string,
                text: string,
        }>().notNull().default({
                background: "#241908",
                accent: "#a10707",
                header: "#ffffff",
                text: "#8c8c8c",
        }),
    },
    (table) => [index('pages_slug_idx').on(table.slug)]
)

export const pageRevisions = sqliteTable(
    'page_revisions',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        pageId: integer('page_id')
            .notNull()
            .references(() => pages.id, { onDelete: 'cascade' }),
        title: text('title').notNull(),
        content: text('content').notNull(),
        editSummary: text('edit_summary'),
        authorId: text('author_id'),
        createdAt: integer('created_at', { mode: 'timestamp' })
            .notNull()
            .$defaultFn(() => new Date()),
    },
    (table) => [index('page_revisions_page_id_idx').on(table.pageId)]
)

export type Page = typeof pages.$inferSelect
export type NewPage = typeof pages.$inferInsert
export type PageRevision = typeof pageRevisions.$inferSelect