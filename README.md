# solid-shim

Minimal Solid data browser - a lightweight alternative to [mashlib](https://github.com/SolidOS/mashlib) using the JSS authentication stack.

## Features

- **Same interface as mashlib** - Drop-in replacement for testing and migration
- **Minimal authentication** - Uses [solid-oidc](https://github.com/JavaScriptSolidServer/solid-oidc) (~600 lines) instead of @inrupt/solid-client-authn-browser (~150KB)
- **Lightweight** - Smaller bundle size with fewer dependencies

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Solid App</title>
</head>
<body id="PageBody">
  <header id="PageHeader"></header>
  <main id="DummyUUID"></main>
  <footer id="PageFooter"></footer>

  <script src="https://unpkg.com/solid-shim/dist/solid-shim.min.js"></script>
  <script>
    panes.runDataBrowser()
  </script>
</body>
</html>
```

## Global Objects

solid-shim exposes the same globals as mashlib:

- `$rdf` - RDF library (rdflib)
- `panes` - Solid panes with `runDataBrowser()` function
- `SolidLogic` - Authentication and store utilities
  - `SolidLogic.authn` - Authentication logic
  - `SolidLogic.authSession` - Session management
  - `SolidLogic.store` - RDF store
  - `SolidLogic.solidLogicSingleton` - Singleton instance
- `mashlib.versionInfo` - Version information

## Development

```bash
git clone https://github.com/JavaScriptSolidServer/solid-shim
cd solid-shim
npm install
npm start
```

## Build

```bash
npm run build
```

## Architecture

```
solid-shim
├── solid-panes-jss (panes and UI components)
│   ├── solid-ui-jss (UI widgets)
│   │   └── solid-logic-jss (core logic)
│   │       └── solid-oidc (authentication)
│   └── various pane packages
└── rdflib (RDF processing)
```

## Credits

This is a minimal alternative to [SolidOS/mashlib](https://github.com/SolidOS/mashlib) using the JSS authentication stack:

- [solid-oidc](https://github.com/JavaScriptSolidServer/solid-oidc) - Minimal Solid-OIDC client
- [solid-logic-jss](https://github.com/JavaScriptSolidServer/solid-logic-jss) - Core logic with solid-oidc
- [solid-ui-jss](https://github.com/JavaScriptSolidServer/solid-ui-jss) - UI widgets
- [solid-panes-jss](https://github.com/JavaScriptSolidServer/solid-panes-jss) - Pane components

## License

MIT
