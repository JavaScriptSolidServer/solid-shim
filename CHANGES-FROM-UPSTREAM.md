# JSS Stack - Changes from Upstream SolidOS

This document tracks all modifications made to create the JavaScriptSolidServer (JSS) authentication and UI stack, replacing @inrupt/solid-client-authn-browser with a minimal solid-oidc implementation.

## Overview

The JSS stack replaces the standard SolidOS/mashlib authentication with a lightweight solid-oidc implementation. This reduces bundle size and removes the dependency on @inrupt packages.

```
┌─────────────────────────────────────────────────────────────┐
│                      solid-shim                             │
│              (mashlib replacement - 1.89MB)                 │
├─────────────────────────────────────────────────────────────┤
│  solid-panes-jss  │  solid-ui-jss  │  solid-logic-jss      │
├───────────────────┴────────────────┴────────────────────────┤
│                       solid-oidc                            │
│              (minimal OIDC + DPoP tokens)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Package Changes

### 1. solid-oidc

**Repository:** `github:JavaScriptSolidServer/solid-oidc`
**Upstream:** New package (no upstream)

Minimal Solid-OIDC implementation providing:
- Authorization Code Grant with PKCE
- Dynamic Client Registration
- DPoP token binding
- Session management with IndexedDB storage
- Refresh token support

**Key files:**
- `solid-oidc.js` - Main implementation
- `src/Session.js` - Session management
- `src/SessionDatabase.js` - IndexedDB storage

**Notable implementation details:**
- Uses `jose` npm package (not CDN) for JWT handling
- Implements manual token exchange for servers without proper redirect support
- ~500 lines vs ~50,000+ in @inrupt/solid-client-authn-browser

---

### 2. solid-logic-jss

**Repository:** `JavaScriptSolidServer/solid-logic-jss`
**Upstream:** `SolidOS/solid-logic`
**Version:** 4.1.0

**Changes from upstream:**

1. **Authentication provider swap:**
   ```diff
   - import { Session } from '@inrupt/solid-client-authn-browser'
   + import { Session } from 'solid-oidc'
   ```

2. **Package.json dependencies:**
   ```diff
   - "@inrupt/solid-client-authn-browser": "^2.0.0"
   + "solid-oidc": "github:JavaScriptSolidServer/solid-oidc"
   ```

3. **TypeScript config:**
   - Added `skipLibCheck: true` to handle rdflib type issues

4. **Build outputs:**
   - `dist/solid-logic.esm.js` - ESM bundle for webpack
   - `dist/solid-logic.umd.js` - UMD bundle

---

### 3. solid-ui-jss

**Repository:** `JavaScriptSolidServer/solid-ui-jss`
**Upstream:** `SolidOS/solid-ui`
**Version:** 3.x

**Changes from upstream:**

1. **Dependency swap:**
   ```diff
   - "solid-logic": "^4.0.0"
   + "solid-logic-jss": "^4.1.0"
   ```

2. **Import updates:**
   All imports of `solid-logic` changed to `solid-logic-jss`

3. **Build outputs:**
   - `dist/solid-ui.esm.js` - ESM bundle (used by solid-shim)
   - `dist/solid-ui.umd.js` - UMD bundle

---

### 4. solid-panes-jss

**Repository:** `JavaScriptSolidServer/solid-panes-jss`
**Upstream:** `SolidOS/solid-panes`
**Version:** 4.0.1

**Changes from upstream:**

1. **Dependency swaps:**
   ```diff
   - "solid-logic": "^4.0.0"
   - "solid-ui": "^3.0.0"
   - "profile-pane": "^2.0.0"
   + "solid-logic-jss": "^4.1.0"
   + "solid-ui-jss": "^3.0.0"
   + "profile-pane-jss": "^2.1.0"
   ```

2. **Import updates in `src/registerPanes.js`:**
   ```diff
   - import profilePane from 'profile-pane'
   + import profilePane from 'profile-pane-jss'
   ```

3. **Dev files updated:**
   - `dev/pane/index.ts`
   - `dev/loader.ts`

---

### 5. profile-pane-jss

**Repository:** `JavaScriptSolidServer/profile-pane-jss`
**Upstream:** `SolidOS/profile-pane`
**Version:** 2.1.0

**Changes from upstream:**

1. **Package renamed:**
   ```diff
   - "name": "profile-pane"
   + "name": "profile-pane-jss"
   ```

2. **New JSS brand colors in `src/baseStyles.ts`:**
   ```typescript
   export const jssColors = {
     primary: '#7C3AED',      // Purple
     primaryDark: '#6D28D9',
     secondary: '#2563EB',    // Blue
     gradient: 'linear-gradient(135deg, #7C3AED, #2563EB)',
     // ... more colors
   }
   ```

3. **Updated card styles:**
   - 16px border radius (was 4px)
   - Purple-tinted shadows
   - Better spacing

4. **ProfileCard.ts changes:**
   - Purple name heading with accent underline
   - Uses `jssColors.primary` as default highlight

5. **ProfileView.ts changes:**
   - Added JSS badge component on QR code card
   - Subtle background gradient

---

### 6. solid-shim (NEW)

**Repository:** `JavaScriptSolidServer/solid-shim`
**Upstream:** None (replaces `SolidOS/mashlib`)
**Version:** 0.2.x

**Purpose:** Drop-in replacement for mashlib using JSS packages.

**Key features:**

1. **Same global interface as mashlib:**
   ```javascript
   window.$rdf = rdflib
   window.panes = solid-panes-jss
   window.UI = solid-ui-jss
   window.SolidLogic = { authn, authSession, store }
   window.mashlib = { versionInfo }
   ```

2. **Webpack configuration (`webpack.config.mjs`):**
   - Resolves symlinked packages correctly
   - Maps globals ($rdf, UI, SolidLogic) to ESM modules
   - Redirects `solid-logic` → `solid-logic-jss`
   - Redirects `solid-ui` → `solid-ui-jss`
   - Replaces jose CDN URL with npm package

3. **JSS Theme (`src/styles.ts`):**
   - Purple/blue gradient header
   - Minimal CSS overrides (soft approach)
   - Custom scrollbars
   - Focus state improvements

4. **Output:**
   - `dist/mashlib.min.js` - Main bundle (~1.89MB vs ~4.6MB original)
   - `dist/841.mashlib.min.js` - Code-split chunk

---

## Bundle Size Comparison

| Package | Original | JSS Version |
|---------|----------|-------------|
| mashlib | ~4.6 MB | - |
| solid-shim | - | ~1.89 MB |
| **Reduction** | | **~59%** |

---

## How to Use

### For JSS Server

Copy solid-shim dist files to JSS's mashlib-local:

```bash
cp solid-shim/dist/mashlib.min.js \
   JavaScriptSolidServer/src/mashlib-local/dist/

cp solid-shim/dist/841.mashlib.min.js \
   JavaScriptSolidServer/src/mashlib-local/dist/
```

### For Development

Link all packages locally:

```bash
# In each package directory:
cd solid-oidc && npm link
cd solid-logic-jss && npm link && npm link solid-oidc
cd solid-ui-jss && npm link && npm link solid-logic-jss
cd solid-panes-jss && npm link && npm link solid-logic-jss solid-ui-jss
cd profile-pane-jss && npm link
cd solid-panes-jss && npm link profile-pane-jss
cd solid-shim && npm link solid-logic-jss solid-ui-jss solid-panes-jss
```

---

## Visual Changes

### Header
- Purple/blue gradient: `linear-gradient(135deg, #7C3AED, #2563EB)`

### Profile Pane
- Purple name headings
- JSS badge on QR code card
- Softer card shadows

### Overall
- Minimal CSS intervention
- Original SolidOS styling preserved
- Header gradient is main branding element

---

## Authentication Flow

1. User clicks "Log in"
2. solid-oidc performs Dynamic Client Registration with IdP
3. Redirects to IdP authorization endpoint (Authorization Code + PKCE)
4. IdP redirects back with code
5. solid-oidc exchanges code for tokens
6. DPoP-bound access token used for authenticated requests
7. Session stored in IndexedDB for persistence

---

## Known Differences from @inrupt

1. **No silent authentication** - Requires explicit login
2. **No iframe refresh** - Uses refresh tokens instead
3. **Simpler error handling** - Less defensive
4. **No Node.js support** - Browser-only

---

## Future Work

- [ ] Publish packages to npm under @jss scope
- [ ] Add more pane customizations
- [ ] Improve error messages
- [ ] Add session timeout handling
- [ ] Test with more IdP providers

---

*Last updated: December 2024*
