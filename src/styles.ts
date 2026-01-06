/**
 * JSS Theme Styles
 * Modern, polished styling for Solid Browser
 */

// JSS Brand Colors
export const jssTheme = {
  primary: '#7C3AED',
  primaryDark: '#6D28D9',
  secondary: '#2563EB',
  gradient: 'linear-gradient(135deg, #7C3AED, #2563EB)',
}

/**
 * Minimal CSS theme - soft enhancements only
 */
export const jssThemeCSS = `
/* ========================================
   JSS Theme - Soft & Minimal
   ======================================== */

:root {
  --jss-primary: #7C3AED;
  --jss-primary-dark: #6D28D9;
  --jss-secondary: #2563EB;
}

/* System font stack */
body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

/* Softer link colors */
a { color: var(--jss-primary-dark); }

/* Selection */
::selection { background: rgba(124, 58, 237, 0.15); }

/* Focus states */
:focus-visible {
  outline: 2px solid rgba(124, 58, 237, 0.4) !important;
  outline-offset: 2px !important;
}

/* Scrollbar */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
`

/**
 * Inject the JSS theme CSS into the document
 */
export function injectJssTheme(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById('jss-theme-styles')) return

  const style = document.createElement('style')
  style.id = 'jss-theme-styles'
  style.textContent = jssThemeCSS
  document.head.appendChild(style)
}

/**
 * Styles for the data browser layout
 */
export const shimStyle = {
  dbLayout: `
    margin: 0;
    padding: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
  `.trim().replace(/\s+/g, ' '),

  dbLayoutHeader: `
    flex: 0 0 auto;
    background: linear-gradient(135deg, ${jssTheme.primary}, ${jssTheme.secondary});
    color: white;
    padding: 12px 20px;
  `.trim().replace(/\s+/g, ' '),

  dbLayoutFooter: `
    flex: 0 0 auto;
    background: #f8fafc;
    border-top: 1px solid #e5e7eb;
    padding: 10px 20px;
    font-size: 12px;
    color: #6b7280;
  `.trim().replace(/\s+/g, ' '),

  dbLayoutContent: `
    flex: 1 1 auto;
    overflow: auto;
    padding: 20px;
    background: #fafafa;
  `.trim().replace(/\s+/g, ' ')
}

export default shimStyle
