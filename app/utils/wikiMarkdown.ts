// app/utils/wikiMarkdown.ts
import MarkdownIt from 'markdown-it'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import {useWikiComponents} from "~/composables/useWikiComponents.ts";

const md = new MarkdownIt({ html: true, linkify: true })

export interface MarkdownSegment {
    type: 'markdown' | 'component'
    content: string
    componentName?: string
    rawAttrs?: Record<string, unknown>
}

function parseAttrString(attrStr?: string): Record<string, unknown> {
    if (!attrStr?.trim()) return {}
    const attrs: Record<string, unknown> = {}
    const pattern = /([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s}]+)))?/g
    let match: RegExpExecArray | null

    while ((match = pattern.exec(attrStr)) !== null) {
        const key = match[1]!
        const rawVal = match[2] ?? match[3] ?? match[4]
        if (rawVal === undefined) {
            attrs[key] = true
        } else if (rawVal === 'true' || rawVal === 'false') {
            attrs[key] = rawVal === 'true'
        } else if (!Number.isNaN(Number(rawVal)) && rawVal.trim() !== '') {
            attrs[key] = Number(rawVal)
        } else {
            attrs[key] = rawVal
        }
    }
    return attrs
}

function formatAttrString(props: Record<string, unknown>): string {
    const entries = Object.entries(props).filter(([, v]) => v !== undefined && v !== '')
    if (!entries.length) return ''

    const formatted = entries.map(([k, v]) => {
        if (typeof v === 'boolean') return v ? k : `${k}="false"`
        if (typeof v === 'number') return `${k}=${v}`
        if (typeof v === 'object') return `${k}='${JSON.stringify(v)}'`
        return `${k}="${String(v).replace(/"/g, '&quot;')}"`
    })

    return `{${formatted.join(' ')}}`
}

/**
 * Depth-aware parser that splits Markdown into plain Markdown segments
 * and `::component-name{...} ... ::` blocks (supports nested components).
 */
export function splitMarkdownSegments(markdown: string): MarkdownSegment[] {
    const lines = markdown.split(/\r?\n/)
    const segments: MarkdownSegment[] = []
    let mdBuffer: string[] = []

    let depth = 0
    let activeName = ''
    let activeAttrs: Record<string, unknown> = {}
    let compBuffer: string[] = []

    const flushMarkdown = () => {
        if (mdBuffer.length) {
            segments.push({ type: 'markdown', content: mdBuffer.join('\n') })
            mdBuffer = []
        }
    }

    for (const line of lines) {
        const openMatch = line.match(/^::([a-z0-9-]+)(?:\{([^}]*)\})?\s*$/)
        const closeMatch = line.match(/^::\s*$/)

        if (depth === 0 && openMatch) {
            flushMarkdown()
            depth = 1
            activeName = openMatch[1]!
            activeAttrs = parseAttrString(openMatch[2])
            compBuffer = []
        } else if (depth > 0 && openMatch) {
            depth++
            compBuffer.push(line)
        } else if (depth > 0 && closeMatch) {
            depth--
            if (depth === 0) {
                segments.push({
                    type: 'component',
                    componentName: activeName,
                    rawAttrs: activeAttrs,
                    content: compBuffer.join('\n'),
                })
            } else {
                compBuffer.push(line)
            }
        } else if (depth > 0) {
            compBuffer.push(line)
        } else {
            mdBuffer.push(line)
        }
    }

    if (depth > 0) {
        // Unclosed block fallback
        mdBuffer.push(`::${activeName}`, ...compBuffer)
    }
    flushMarkdown()

    return segments
}

/**
 * Converts stored Markdown into HTML ready for TipTap `editor.commands.setContent()`.
 */
export function markdownToTipTapHtml(markdown: string): string {
    const { coerceProps } = useWikiComponents()
    const segments = splitMarkdownSegments(markdown)

    return segments
        .map((seg) => {
            if (seg.type === 'markdown') {
                return md.render(seg.content)
            }
            const name = seg.componentName!
            const coerced = coerceProps(name, seg.rawAttrs ?? {})
            const innerHtml = seg.content.trim() ? markdownToTipTapHtml(seg.content) : '<p></p>'
            const escapedProps = JSON.stringify(coerced).replace(/"/g, '&quot;')
            return `<div data-wiki-component="${name}" data-props="${escapedProps}">${innerHtml}</div>`
        })
        .join('\n')
}

function serializeInlineContent(node: ProseMirrorNode): string {
    let out = ''
    node.forEach((child) => {
        if (child.isText) {
            let text = child.text ?? ''
            for (const mark of child.marks) {
                if (mark.type.name === 'bold') text = `**${text}**`
                else if (mark.type.name === 'italic') text = `*${text}*`
                else if (mark.type.name === 'code') text = `\`${text}\``
                else if (mark.type.name === 'strike') text = `~~${text}~~`
                else if (mark.type.name === 'link') text = `[${text}](${mark.attrs.href})`
            }
            out += text
        } else if (child.type.name === 'hardBreak') {
            out += '  \n'
        }
    })
    return out
}

/**
 * Serializes a TipTap ProseMirror document back into clean Markdown with `::component` blocks.
 */
export function tipTapDocToMarkdown(doc: ProseMirrorNode): string {
    const blocks: string[] = []

    doc.forEach((node) => {
        switch (node.type.name) {
            case 'paragraph':
                blocks.push(serializeInlineContent(node))
                break
            case 'heading':
                blocks.push(`${'#'.repeat(node.attrs.level)} ${serializeInlineContent(node)}`)
                break
            case 'bulletList': {
                const items: string[] = []
                node.forEach((li) => items.push(`- ${tipTapDocToMarkdown(li)}`))
                blocks.push(items.join('\n'))
                break
            }
            case 'orderedList': {
                const items: string[] = []
                let idx = node.attrs.start ?? 1
                node.forEach((li) => items.push(`${idx++}. ${tipTapDocToMarkdown(li)}`))
                blocks.push(items.join('\n'))
                break
            }
            case 'blockquote':
                blocks.push(
                    tipTapDocToMarkdown(node)
                        .split('\n')
                        .map((line) => `> ${line}`)
                        .join('\n')
                )
                break
            case 'codeBlock':
                blocks.push(`\`\`\`${node.attrs.language ?? ''}\n${node.textContent}\n\`\`\``)
                break
            case 'horizontalRule':
                blocks.push('---')
                break
            case 'wikiComponent': {
                const name = node.attrs.componentName
                const attrStr = formatAttrString(node.attrs.props ?? {})
                const innerMd = tipTapDocToMarkdown(node).trim()
                blocks.push(innerMd ? `::${name}${attrStr}\n${innerMd}\n::` : `::${name}${attrStr}\n::`)
                break
            }
            default:
                if (node.textContent) blocks.push(node.textContent)
        }
    })

    return blocks.join('\n\n')
}