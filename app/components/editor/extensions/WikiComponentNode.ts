// app/components/editor/extensions/WikiComponentNode.ts
import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import WikiComponentView from '../WikiComponentView.vue'

export interface WikiComponentAttrs {
    componentName: string
    props: Record<string, unknown>
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        wikiComponent: {
            insertWikiComponent: (attrs: WikiComponentAttrs) => ReturnType
        }
    }
}

export const WikiComponentNode = Node.create({
    name: 'wikiComponent',
    group: 'block',
    content: 'block*',
    isolating: true,
    defining: true,

    addAttributes() {
        return {
            componentName: {
                default: '',
                parseHTML: (el) => el.getAttribute('data-wiki-component') ?? '',
                renderHTML: (attrs) => ({ 'data-wiki-component': attrs.componentName }),
            },
            props: {
                default: {},
                parseHTML: (el) => {
                    const raw = el.getAttribute('data-props')
                    if (!raw) return {}
                    try {
                        return JSON.parse(raw)
                    } catch {
                        return {}
                    }
                },
                renderHTML: (attrs) => ({
                    'data-props': JSON.stringify(attrs.props ?? {}),
                }),
            },
        }
    },

    parseHTML() {
        return [{ tag: 'div[data-wiki-component]' }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes), 0]
    },

    addCommands() {
        return {
            insertWikiComponent:
                (attrs) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs,
                            content: [{ type: 'paragraph' }],
                        })
                    },
        }
    },

    addNodeView() {
        return VueNodeViewRenderer(WikiComponentView)
    },
})