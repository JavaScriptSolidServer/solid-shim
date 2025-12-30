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

declare module 'solid-ui-jss' {
  export const login: any
  export const widgets: any
  export const icons: any
  export const ns: any
  export const style: any
  export const utils: any
  export const dom: any
  export const acl: any
  export const aclControl: any
  export const create: any
  export const log: any
  export const matrix: any
  export const media: any
  export const messageArea: any
  export const pad: any
  export const participation: any
  export const preferences: any
  export const table: any
  export const tabs: any
  export const initHeader: any
  export const initFooter: any
}
