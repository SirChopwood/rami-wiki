import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    schema: './server/database/schema/*',
    out: './server/database/migrations/',
    dialect: 'sqlite',
})