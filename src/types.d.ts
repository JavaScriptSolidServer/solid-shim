// Type declarations for packages without types
declare module 'solid-panes-jss' {
  export function initMainPage(store: any, uri?: any): any
  export function getOutliner(dom: Document): any
  export * from 'pane-registry'
}

declare module 'solid-logic-jss' {
  export const authn: any
  export const authSession: any
  export const store: any
  export const solidLogicSingleton: any
}
