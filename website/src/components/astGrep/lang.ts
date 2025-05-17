import init, { setupParser, initializeTreeSitter, findNodes, fixErrors } from 'ast-grep-wasm'
import type { InjectionKey, Ref } from 'vue'
import { shallowRef, watchEffect, provide } from 'vue'
import { parserPaths } from '../../../_data/parsers'

export type SupportedLang = keyof typeof parserPaths

// monaco does not realize bash is shell but shell is not bash.
// use this mapping to highlight bash
const monacoLangMapping: Record<string, string> = {
  bash: 'shell'
}
export function normalizeMonacoLang(lang: string) {
  return monacoLangMapping[lang] || lang
}

export const languageDisplayNames: Record<SupportedLang, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  // not so well supported lang...
  bash: 'Bash',
  c: 'C',
  csharp: 'C#',
  css: 'CSS',
  cpp: 'C++',
  elixir: 'Elixir',
  go: 'Go',
  html: 'HTML',
  java: 'Java',
  json: 'JSON',
  kotlin: 'Kotlin',
  php: 'PHP',
  python: 'Python',
  razor: 'Razor'
  ruby: 'Ruby',
  rust: 'Rust',
  scala: 'Scala',
  swift: 'Swift',
  yaml: 'YAML',
}

export async function initializeParser() {
  await init()
  await initializeTreeSitter()
}

async function setGlobalParser(lang: SupportedLang) {
  const path = 'parsers/' + parserPaths[lang]
  await setupParser(lang, path)
}

export type Match = {
  type: 'rule',
  severity: string,
  message: string,
  rule: string,
  env: any,
  id: number,
  range: [number, number, number, number],
} | {
  type: 'simple',
  env: any,
  id: number,
  range: [number, number, number, number],
}

function shouldDisplayDiagnostic(rule: any) {
  return (
    !/test-rule-\d+/.test(rule.id) &&
    rule.message &&
    ['info', 'warning', 'error'].includes(rule.severity)
  )
}

export async function doFind(src: string, json: any[]): Promise<[Match[], string]> {
  if (!src || !json) {
    return [[], src]
  }
  const result = await findNodes(src, json)
  let matches: Match[] = []
  for (let [ruleId, nodes] of result.entries()) {
    for (let rule of json) {
      if (rule.id !== ruleId) {
        continue;
      }
      if (shouldDisplayDiagnostic(rule)) {
        for (let nm of nodes) {
          matches.push({
            type: 'rule',
            rule: rule.id,
            severity: rule.severity,
            message: nm.message,
            range: nm.node.range,
            env: nm.env,
            id: nm.id,
          })
        }
      } else {
        for (let nm of nodes) {
          matches.push({
            type: 'simple',
            range: nm.node.range,
            env: nm.env,
            id: nm.id,
          })
        }
      }
      break;
    }
  }
  const fixed = fixErrors(src, json)
  return [matches, fixed]
}

export const langLoadedKey = Symbol.for('lang-loaded') as InjectionKey<Ref<boolean>>

export function useSetupParser(lang: Ref<SupportedLang>) {
  let langLoaded = shallowRef(false)
  watchEffect(async () => {
    langLoaded.value = false
    try {
      await setGlobalParser(lang.value)
    } catch (e) {
      console.error(e)
    }
    langLoaded.value = true
  })
  provide(langLoadedKey, langLoaded)
  return langLoaded
}