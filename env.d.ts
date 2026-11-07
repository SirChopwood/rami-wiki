import type { D1Database, R2Bucket } from '@cloudflare/workers-types'

declare module 'h3' {
    interface H3EventContext {
        cloudflare: {
            env: {
                rami_wiki_db: D1Database
                rami_wiki_media: R2Bucket
            }
        }
    }
}