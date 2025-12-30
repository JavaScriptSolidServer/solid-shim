/**
 * solid-shim - Minimal Solid data browser
 *
 * Drop-in replacement for mashlib using solid-panes-jss with solid-oidc authentication.
 * Provides the same interface as mashlib for easy testing and migration.
 */

import * as $rdf from 'rdflib'
import * as panes from 'solid-panes-jss'
import { authn, solidLogicSingleton, authSession, store } from 'solid-logic-jss'
import { versionInfo } from './versionInfo'
import { shimStyle } from './styles'

const global: any = window

// Expose globals - same interface as mashlib
global.$rdf = $rdf
global.panes = panes
global.SolidLogic = {
  authn,
  authSession,
  store,
  solidLogicSingleton
}
global.mashlib = {
  versionInfo
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
export { $rdf, panes, authn, authSession, store, solidLogicSingleton }
