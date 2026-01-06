/**
 * solid-shim - Minimal Solid data browser
 *
 * Drop-in replacement for mashlib using solid-panes-jss with solid-oidc authentication.
 * Provides the same interface as mashlib for easy testing and migration.
 *
 * Supports @view proposal for JSON-LD (self-describing view hint)
 * See: https://github.com/w3c/json-ld-syntax/issues/384
 */

import * as $rdf from 'rdflib'
import * as panes from 'solid-panes-jss'
import * as UI from 'solid-ui-jss'
import { authn, solidLogicSingleton, authSession, store } from 'solid-logic-jss'
import { versionInfo } from './versionInfo'
import { shimStyle, injectJssTheme } from './styles'

const global: any = window
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'

/**
 * Pane module interface for @view
 */
interface PaneModule {
  name?: string
  render: (subject: $rdf.NamedNode, context: PaneContext) => HTMLElement
}

interface PaneContext {
  dom: Document
  session: { store: $rdf.Store }
}

/**
 * Parse JSON-LD data island from page into RDF store
 */
function parseJsonLdToStore(jsonld: any, baseUri: string, targetStore: $rdf.Store): $rdf.NamedNode {
  const rootId = baseUri + (jsonld['@id'] || '#thing')

  function addTriples(node: any, subjectUri: string) {
    const subject = $rdf.sym(subjectUri)

    // Add type
    if (node['@type']) {
      const typeUri = node['@type'].replace('schema:', 'http://schema.org/')
      targetStore.add(subject, $rdf.sym(RDF_TYPE), $rdf.sym(typeUri))
    }

    // Add properties
    Object.entries(node).forEach(([key, val]: [string, any]) => {
      if (key.startsWith('@')) return
      const pred = $rdf.sym(key.replace('schema:', 'http://schema.org/'))

      if (Array.isArray(val)) {
        val.forEach((item: any, i: number) => {
          if (typeof item === 'object' && !item['@id']) {
            const blankId = `${subjectUri}_${key}_${i}`
            targetStore.add(subject, pred, $rdf.sym(blankId))
            addTriples(item, blankId)
          } else if (typeof item === 'object' && item['@id']) {
            const uri = item['@id'].startsWith('http') ? item['@id'] : baseUri + item['@id']
            targetStore.add(subject, pred, $rdf.sym(uri))
          } else {
            targetStore.add(subject, pred, item)
          }
        })
      } else if (typeof val === 'object' && val['@id']) {
        const uri = val['@id'].startsWith('http') ? val['@id'] : baseUri + val['@id']
        targetStore.add(subject, pred, $rdf.sym(uri))
      } else if (typeof val === 'object') {
        const blankId = `${subjectUri}_${key}`
        targetStore.add(subject, pred, $rdf.sym(blankId))
        addTriples(val, blankId)
      } else {
        targetStore.add(subject, pred, val)
      }
    })
  }

  addTriples(jsonld, rootId)
  return $rdf.sym(rootId)
}

/**
 * Render JSON-LD using @view
 *
 * Implements the @view proposal: data specifies its own preferred renderer.
 * See: https://github.com/w3c/json-ld-syntax/issues/384
 *
 * @param options.target - Element to render into (default: creates one after JSON-LD script)
 * @param options.subject - Subject ID to render (default: @id from JSON-LD or '#thing')
 * @param options.fallbackPane - Pane to use if @view fails or is missing
 */
async function renderView(options: {
  target?: HTMLElement | string
  subject?: string
  fallbackPane?: PaneModule
} = {}): Promise<{ subject: $rdf.NamedNode; store: $rdf.Store } | null> {
  // Find JSON-LD on page
  const jsonLdScript = document.querySelector('script[type="application/ld+json"]')
  if (!jsonLdScript) {
    console.warn('[solid-shim] No JSON-LD found on page')
    return null
  }

  let jsonld: any
  try {
    jsonld = JSON.parse(jsonLdScript.textContent || '')
  } catch (e) {
    console.error('[solid-shim] Invalid JSON-LD:', e)
    return null
  }

  // Parse into store
  const baseUri = window.location.href.split('#')[0]
  const subjectId = options.subject || jsonld['@id'] || '#thing'
  const subject = parseJsonLdToStore(jsonld, baseUri, store)

  // Override subject if specified
  const finalSubject = options.subject
    ? $rdf.sym(baseUri + options.subject)
    : subject

  // Load pane from @view or fallback
  let pane: PaneModule | undefined
  if (jsonld['@view']) {
    try {
      console.log(`[solid-shim] Loading @view: ${jsonld['@view']}`)
      const paneModule = await import(/* webpackIgnore: true */ jsonld['@view'])
      pane = paneModule.default || paneModule
    } catch (err) {
      console.warn(`[solid-shim] Failed to load @view "${jsonld['@view']}":`, err)
    }
  }

  if (!pane && options.fallbackPane) {
    pane = options.fallbackPane
  }

  if (!pane) {
    console.warn('[solid-shim] No @view specified and no fallback pane provided')
    return { subject: finalSubject, store }
  }

  // Find or create target element
  let target: HTMLElement | null = null
  if (typeof options.target === 'string') {
    target = document.querySelector(options.target)
  } else if (options.target) {
    target = options.target
  }

  if (!target) {
    target = document.createElement('div')
    target.id = 'solid-shim-view'
    jsonLdScript.parentNode?.insertBefore(target, jsonLdScript.nextSibling)
  }

  // Render
  const context: PaneContext = {
    dom: document,
    session: { store }
  }

  try {
    const rendered = pane.render(finalSubject, context)
    target.appendChild(rendered)
  } catch (e: any) {
    console.error('[solid-shim] Render error:', e)
    target.innerHTML = `<p style="color: #dc2626; padding: 1rem;">Error rendering: ${e.message}</p>`
  }

  return { subject: finalSubject, store }
}

// Inject JSS theme styles immediately
injectJssTheme()

// Expose globals - same interface as mashlib
global.$rdf = $rdf
global.panes = panes
global.UI = UI
global.SolidLogic = {
  authn,
  authSession,
  store,
  solidLogicSingleton
}
global.mashlib = {
  versionInfo
}

// Expose @view renderer globally
global.solidShim = {
  renderView,
  parseJsonLdToStore
}

/**
 * Initialize and run the Solid data browser
 * @param uri - Optional URI to display initially
 */
global.panes.runDataBrowser = function (uri?: string | $rdf.NamedNode | null) {
  // Apply layout styles
  document.getElementById('PageBody')?.setAttribute('style', shimStyle.dbLayout)
  document.getElementById('PageHeader')?.setAttribute('style', shimStyle.dbLayoutHeader)
  document.getElementById('PageFooter')?.setAttribute('style', shimStyle.dbLayoutFooter)
  document.getElementById('DummyUUID')?.setAttribute('style', shimStyle.dbLayoutContent)

  // Set up cross-site proxy
  const fetcher: any = $rdf.Fetcher
  fetcher.crossSiteProxyTemplate = window.origin + '/xss/?uri={uri}'

  // Add web monetization tag to page header
  try {
    const webMonetizationTag: HTMLElement = document.createElement('meta')
    webMonetizationTag.setAttribute('name', 'monetization')
    webMonetizationTag.setAttribute('content', `$${window.location.host}`)
    document.head.appendChild(webMonetizationTag)
  } catch (e) {
    console.error('Failed to add web monetization tag to page header')
  }

  // Authenticate the user
  authn.checkUser().then(function (_profile: any) {
    const mainPage = panes.initMainPage(solidLogicSingleton.store, uri)
    return mainPage
  })
}

// Handle browser back/forward navigation
window.onpopstate = function (_event: any) {
  global.document.outline?.GotoSubject?.(
    $rdf.sym(window.document.location.href),
    true,
    undefined,
    true,
    undefined
  )
}

// Legacy dump function for compatibility
function dump(msg: string[]) {
  console.log(msg.slice(0, -1))
}

global.dump = dump

// Export for ES modules
export { versionInfo }
export { $rdf, panes, UI, authn, authSession, store, solidLogicSingleton }
export { renderView, parseJsonLdToStore }
export type { PaneModule, PaneContext }

// Auto-render: if JSON-LD with @view exists, render automatically
// No attribute needed - @view in data IS the opt-in
if (typeof document !== 'undefined') {
  const jsonLdScript = document.querySelector('script[type="application/ld+json"]')
  if (jsonLdScript) {
    try {
      const data = JSON.parse(jsonLdScript.textContent || '')
      if (data['@view']) {
        renderView()
      }
    } catch (e) {
      // Invalid JSON-LD, skip auto-render
    }
  }
}
