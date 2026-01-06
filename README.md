# solid-shim

Minimal Solid data browser - a lightweight alternative to [mashlib](https://github.com/SolidOS/mashlib) using the JSS authentication stack.

## Features

- **Same interface as mashlib** - Drop-in replacement for testing and migration
- **@view support** - Self-describing JSON-LD views ([W3C proposal](https://github.com/w3c/json-ld-syntax/issues/384))
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

## @view - Self-Describing JSON-LD

solid-shim supports the `@view` proposal for JSON-LD, allowing data to specify its own renderer.

```html
<!DOCTYPE html>
<html>
<body>
  <script type="application/ld+json">
  {
    "@context": { "schema": "http://schema.org/" },
    "@type": "schema:Person",
    "@view": "https://jsonos.com/examples/src/panes/person.js",
    "schema:name": "Marie Curie",
    "schema:jobTitle": "Physicist"
  }
  </script>

  <script src="https://jsonos.com/browser/dist/mashlib.min.js"></script>
  <script>
    solidShim.renderView()
  </script>
</body>
</html>
```

When `renderView()` is called, solid-shim:
1. Finds the JSON-LD on the page
2. Parses it into the RDF store
3. Loads the pane module from the `@view` URL
4. Calls the pane's `render(subject, context)` function

### renderView Options

```javascript
solidShim.renderView({
  target: '#myDiv',        // Element or selector to render into
  subject: '#me',          // Subject ID to render (default: @id from JSON-LD)
  fallbackPane: myPane     // Pane to use if @view fails or is missing
})
```

### Pane Module Format

Pane modules are ES modules with a `render` function:

```javascript
export default {
  name: 'person',
  render(subject, context) {
    const store = context.session.store
    const div = document.createElement('div')
    // ... render logic
    return div
  }
}
```

See the [W3C proposal](https://github.com/w3c/json-ld-syntax/issues/384) for more details.

## Global Objects

solid-shim exposes the same globals as mashlib:

- `$rdf` - RDF library (rdflib)
- `panes` - Solid panes with `runDataBrowser()` function
- `SolidLogic` - Authentication and store utilities
  - `SolidLogic.authn` - Authentication logic
  - `SolidLogic.authSession` - Session management
  - `SolidLogic.store` - RDF store
  - `SolidLogic.solidLogicSingleton` - Singleton instance
- `solidShim` - @view renderer
  - `solidShim.renderView(options)` - Render JSON-LD using @view
  - `solidShim.parseJsonLdToStore(jsonld, baseUri, store)` - Parse JSON-LD into RDF store
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
