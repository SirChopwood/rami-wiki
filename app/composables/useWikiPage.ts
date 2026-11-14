// app/composables/useWikiPage.ts
import type { MaybeRefOrGetter } from 'vue'

export interface WikiPage {
    id: number
    slug: string
    title: string
    content: string
    summary: string | null
    isPublished: boolean
    authorId: string | null
    updatedBy: string | null
    createdAt: string | Date
    updatedAt: string | Date
    colours: Record<string, string>
}

interface WikiEditorState {
    slug: string
    isEditing: boolean
    draftTitle: string
    draftContent: string
    isSaving: boolean
    error: string | null
}

export function useWikiPage(explicitSlug?: MaybeRefOrGetter<string | undefined>) {
    const route = useRoute()

    const resolvedSlug = computed(() => {
        const custom = toValue(explicitSlug)
        if (custom !== undefined) return custom

        const param = route.params.slug
        return Array.isArray(param) ? param.join('/') : (param ?? '')
    })

    // Shared across all components viewing the same slug via Nuxt's payload cache
    const {
        data: page,
        status,
        error: fetchError,
        refresh,
    } = useAsyncData<WikiPage | null>(
        computed(() => `wiki-page:${resolvedSlug.value}`),
        async () => {
            if (!resolvedSlug.value) return null
            return await $fetch<WikiPage>(`/api/pages/${resolvedSlug.value}`)
        },
        {
            watch: [resolvedSlug],
        }
    )

    // Shared SSR-safe editor state accessible anywhere in layouts/headers/sidebars
    const editorState = useState<WikiEditorState>('wiki-editor-state', () => ({
        slug: '',
        isEditing: false,
        draftTitle: '',
        draftContent: '',
        isSaving: false,
        error: null,
    }))

    // Reset edit mode automatically if the user navigates to a different wiki page
    watch(resolvedSlug, (nextSlug) => {
        if (editorState.value.slug !== nextSlug) {
            editorState.value = {
                slug: nextSlug,
                isEditing: false,
                draftTitle: '',
                draftContent: '',
                isSaving: false,
                error: null,
            }
        }
    })

    const isEditing = computed({
        get: () => editorState.value.isEditing && editorState.value.slug === resolvedSlug.value,
        set: (val: boolean) => {
            editorState.value.isEditing = val
        },
    })

    const draftTitle = computed({
        get: () => editorState.value.draftTitle,
        set: (val: string) => {
            editorState.value.draftTitle = val
        },
    })

    const draftContent = computed({
        get: () => editorState.value.draftContent,
        set: (val: string) => {
            editorState.value.draftContent = val
        },
    })

    const isSaving = computed(() => editorState.value.isSaving)
    const saveError = computed(() => editorState.value.error)

    function startEditing() {
        if (!page.value) return
        editorState.value = {
            slug: resolvedSlug.value,
            isEditing: true,
            draftTitle: page.value.title,
            draftContent: page.value.content,
            isSaving: false,
            error: null,
        }
    }

    function cancelEditing() {
        editorState.value.isEditing = false
        editorState.value.error = null
    }

    async function savePage(editSummary?: string) {
        if (!resolvedSlug.value || editorState.value.isSaving) return

        editorState.value.isSaving = true
        editorState.value.error = null

        try {
            const updated = await $fetch<WikiPage>(`/api/pages/${resolvedSlug.value}`, {
                method: 'PUT',
                body: {
                    title: editorState.value.draftTitle,
                    content: editorState.value.draftContent,
                    editSummary,
                },
            })

            page.value = updated
            editorState.value.isEditing = false
            return updated
        } catch (err: any) {
            editorState.value.error =
                err?.data?.statusMessage || err?.message || 'Failed to save page'
            throw err
        } finally {
            editorState.value.isSaving = false
        }
    }

    async function createPage(payload: { slug: string, title: string }) {
        const created = await $fetch<WikiPage>('/api/pages', {
            method: 'POST',
            body: payload,
        })

        if (payload.slug === resolvedSlug.value) {
            page.value = created
        }

        return created
    }

    async function deletePage() {
        if (!resolvedSlug.value) return
        // @ts-ignore
        await $fetch(`/api/pages/${resolvedSlug.value}`, { method: 'DELETE' })
        page.value = null
        cancelEditing()
    }

    return {
        slug: resolvedSlug,
        page,
        status,
        fetchError,
        refresh,
        isEditing,
        draftTitle,
        draftContent,
        isSaving,
        saveError,
        startEditing,
        cancelEditing,
        savePage,
        createPage,
        deletePage
    }
}