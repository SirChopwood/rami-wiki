export default defineEventHandler(async (event) => {
    // Grab the dynamic path from the URL (e.g., "uploads/123-image.jpg")
    const path = event.context.params?.path

    if (!path) {
        throw createError({ statusCode: 400, statusMessage: 'Image path required' })
    }

    const bucket = event.context.cloudflare.env.rami_wiki_media
    const object = await bucket.get(path)

    if (!object) {
        throw createError({ statusCode: 404, statusMessage: 'Image not found' })
    }

    // Pass Cloudflare R2 headers through to the browser
    setHeaders(event, {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'ETag': object.httpEtag
    })

    // Return the R2 ReadableStream directly to the client
    return object.body
})