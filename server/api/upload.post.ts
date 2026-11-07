import {requirePermission} from "#server/utils/auth.ts";

export default defineEventHandler(async (event) => {
    const user = await requirePermission(event, 'edit:upload')

    const formData = await readMultipartFormData(event)
    const file = formData?.find(item => item.name === 'file')

    if (!file || !file.filename) {
        throw createError({ statusCode: 400, statusMessage: 'No file provided' })
    }

    // 1. Validate File Type (Only allow specific image formats)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!file.type || !allowedTypes.includes(file.type)) {
        throw createError({
            statusCode: 415,
            statusMessage: 'Unsupported Media Type. Only JPG, PNG, WEBP, and GIF are allowed.'
        })
    }

    // 2. Validate File Size (e.g., 5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024 // 5 Megabytes in bytes
    if (file.data.length > MAX_SIZE) {
        throw createError({
            statusCode: 413,
            statusMessage: 'Payload Too Large. File must be under 5MB.'
        })
    }

    const bucket = event.context.cloudflare.env.rami_wiki_media
    const key = `uploads/${Date.now()}-${file.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    // Put file buffer into R2
    await bucket.put(key, file.data, {
        httpMetadata: { contentType: file.type }
    })

    // Return the path so the frontend knows how to request it
    return { success: true, key }
})