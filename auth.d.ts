// Extend the auth-utils session types
declare module '#auth-utils' {
    export interface User {
        id: number
        
        discord_id?: string
        discord_username?: string
        discord_avatar?: string

        steam_id?: string
        steam_username?: string
        steam_avatar?: string
        
        role: string
    }
}