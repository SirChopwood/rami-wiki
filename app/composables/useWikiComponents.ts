// app/composables/useWikiComponents.ts
import type { Component } from 'vue'

export interface PropFieldSchema {
  name: string
  type: 'string' | 'number' | 'boolean' | 'json'
  defaultValue: unknown
}

export interface WikiComponentDefinition {
  kebabName: string
  pascalName: string
  label: string
  description?: string
  component: Component
  propSchema: PropFieldSchema[]
  defaultProps: Record<string, unknown>
}

interface ComponentModule {
  default: Component & {
    props?: Record<string, any>
    wikiMeta?: { label?: string; description?: string }
  }
}

function toPascalCase(str: string): string {
  return str
      .replace(/\.vue$/i, '')
      .split(/[-_/]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
}

function toKebabCase(str: string): string {
  return str
      .replace(/\.vue$/i, '')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/[_\s/]+/g, '-')
      .toLowerCase()
}

function inferPropType(rawProp: any): PropFieldSchema['type'] {
  const ctor = Array.isArray(rawProp?.type) ? rawProp.type[0] : rawProp?.type ?? rawProp
  if (ctor === Boolean) return 'boolean'
  if (ctor === Number) return 'number'
  if (ctor === Array || ctor === Object) return 'json'
  return 'string'
}

function extractPropSchema(rawProps?: Record<string, any>): {
  propSchema: PropFieldSchema[]
  defaultProps: Record<string, unknown>
} {
  if (!rawProps) return { propSchema: [], defaultProps: {} }

  const propSchema: PropFieldSchema[] = []
  const defaultProps: Record<string, unknown> = {}

  for (const [name, def] of Object.entries(rawProps)) {
    const type = inferPropType(def)
    let defaultValue: unknown =
        typeof def?.default === 'function' ? def.default() : def?.default

    if (defaultValue === undefined) {
      if (type === 'boolean') defaultValue = false
      else if (type === 'number') defaultValue = 0
      else if (type === 'json') defaultValue = {}
      else defaultValue = ''
    }

    propSchema.push({ name, type, defaultValue })
    defaultProps[name] = defaultValue
  }

  return { propSchema, defaultProps }
}

const modules = import.meta.glob<ComponentModule>('~/components/wiki/**/*.vue', {
  eager: true,
})

let registry: Map<string, WikiComponentDefinition> | null = null

function getRegistry(): Map<string, WikiComponentDefinition> {
  if (registry) return registry

  registry = new Map<string, WikiComponentDefinition>()

  for (const [filePath, mod] of Object.entries(modules)) {
    const comp = mod?.default
    if (!comp) continue

    const relativeName = filePath.split('/components/wiki/')[1] ?? filePath
    const kebabName = toKebabCase(relativeName)
    const pascalName = toPascalCase(relativeName)
    const { propSchema, defaultProps } = extractPropSchema(comp.props)

    registry.set(kebabName, {
      kebabName,
      pascalName,
      label: comp.wikiMeta?.label ?? pascalName.replace(/([a-z])([A-Z])/g, '$1 $2'),
      description: comp.wikiMeta?.description,
      component: comp,
      propSchema,
      defaultProps,
    })
  }

  return registry
}

export function useWikiComponents() {
  const map = getRegistry()
  const components = computed(() => Array.from(map.values()))

  function getComponent(name: string): WikiComponentDefinition | undefined {
    return map.get(toKebabCase(name))
  }

  function coerceProps(
      name: string,
      rawAttrs: Record<string, string | boolean | number | unknown>
  ): Record<string, unknown> {
    const def = getComponent(name)
    if (!def) return { ...rawAttrs }

    const result: Record<string, unknown> = { ...def.defaultProps }
    const schemaMap = new Map(def.propSchema.map((p) => [p.name, p]))

    for (const [key, val] of Object.entries(rawAttrs)) {
      const schema = schemaMap.get(key)
      if (!schema) {
        result[key] = val
        continue
      }

      if (schema.type === 'boolean') {
        result[key] = val === true || val === 'true' || val === ''
      } else if (schema.type === 'number') {
        const parsed = Number(val)
        result[key] = Number.isNaN(parsed) ? schema.defaultValue : parsed
      } else if (schema.type === 'json' && typeof val === 'string') {
        try {
          result[key] = JSON.parse(val)
        } catch {
          result[key] = schema.defaultValue
        }
      } else {
        result[key] = val
      }
    }

    return result
  }

  return {
    components,
    getComponent,
    coerceProps,
  }
}