/**
 * Schema.org Person Pane
 * Beautiful rendering of schema:Person
 */

(function() {
'use strict';

const SCHEMA = $rdf.Namespace('http://schema.org/')

// Simple inline SVG icon as data URI
const PERSON_ICON = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>')

const personPane = {
  name: 'schemaPerson',

  icon: PERSON_ICON,

  label: function(subject, context) {
    const store = context.session.store
    const types = store.findTypeURIs(subject)

    if (types[SCHEMA('Person').uri]) {
      return 'Profile'
    }
    return null
  },

  render: function(subject, context) {
    const store = context.session.store
    const dom = context.dom

    const div = dom.createElement('div')
    div.className = 'schema-person-pane'
    div.style.cssText = `
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      padding: 32px;
      max-width: 480px;
      margin: 0 auto;
    `

    // Get properties
    const name = store.anyValue(subject, SCHEMA('name'))
    const description = store.anyValue(subject, SCHEMA('description'))
    const image = store.any(subject, SCHEMA('image'))
    const jobTitle = store.anyValue(subject, SCHEMA('jobTitle'))
    const url = store.any(subject, SCHEMA('url'))
    const birthDate = store.anyValue(subject, SCHEMA('birthDate'))
    const email = store.anyValue(subject, SCHEMA('email'))
    const worksFor = store.any(subject, SCHEMA('worksFor'))

    // Card with gradient border
    const card = dom.createElement('div')
    card.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 24px;
      padding: 3px;
      box-shadow: 0 25px 50px -12px rgba(102, 126, 234, 0.4);
    `

    const inner = dom.createElement('div')
    inner.style.cssText = `
      background: #ffffff;
      border-radius: 22px;
      padding: 32px;
      text-align: center;
    `

    // Avatar with ring
    if (image) {
      const avatarWrap = dom.createElement('div')
      avatarWrap.style.cssText = `
        width: 140px;
        height: 140px;
        margin: 0 auto 24px;
        padding: 4px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
      `
      const img = dom.createElement('img')
      img.src = image.uri || image.value
      img.style.cssText = `
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 4px solid white;
      `
      avatarWrap.appendChild(img)
      inner.appendChild(avatarWrap)
    }

    // Name
    if (name) {
      const h1 = dom.createElement('h1')
      h1.textContent = name
      h1.style.cssText = `
        margin: 0 0 8px 0;
        font-size: 1.75rem;
        font-weight: 700;
        color: #1a1a2e;
        letter-spacing: -0.025em;
      `
      inner.appendChild(h1)
    }

    // Job title with pill style
    if (jobTitle) {
      const pill = dom.createElement('span')
      pill.textContent = jobTitle
      pill.style.cssText = `
        display: inline-block;
        background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
        color: #667eea;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 16px;
      `
      inner.appendChild(pill)
    }

    // Works for
    if (worksFor) {
      const orgName = store.anyValue(worksFor, SCHEMA('name'))
      if (orgName) {
        const org = dom.createElement('p')
        org.textContent = '@ ' + orgName
        org.style.cssText = `
          margin: 0 0 16px 0;
          color: #64748b;
          font-size: 0.9rem;
        `
        inner.appendChild(org)
      }
    }

    // Description
    if (description) {
      const desc = dom.createElement('p')
      desc.textContent = description
      desc.style.cssText = `
        margin: 0 0 20px 0;
        color: #475569;
        line-height: 1.6;
        font-size: 0.95rem;
      `
      inner.appendChild(desc)
    }

    // Divider
    const divider = dom.createElement('div')
    divider.style.cssText = `
      height: 1px;
      background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
      margin: 20px 0;
    `
    inner.appendChild(divider)

    // Info row
    const infoRow = dom.createElement('div')
    infoRow.style.cssText = `
      display: flex;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    `

    if (birthDate) {
      const item = dom.createElement('div')
      item.style.cssText = 'text-align: center;'
      const label = dom.createElement('div')
      label.textContent = 'Born'
      label.style.cssText = 'font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;'
      const value = dom.createElement('div')
      value.textContent = new Date(birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      value.style.cssText = 'font-size: 0.9rem; color: #334155; font-weight: 500; margin-top: 4px;'
      item.appendChild(label)
      item.appendChild(value)
      infoRow.appendChild(item)
    }

    if (email) {
      const item = dom.createElement('div')
      item.style.cssText = 'text-align: center;'
      const label = dom.createElement('div')
      label.textContent = 'Email'
      label.style.cssText = 'font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;'
      const value = dom.createElement('a')
      value.href = 'mailto:' + email
      value.textContent = email
      value.style.cssText = 'font-size: 0.9rem; color: #667eea; font-weight: 500; margin-top: 4px; display: block; text-decoration: none;'
      item.appendChild(label)
      item.appendChild(value)
      infoRow.appendChild(item)
    }

    inner.appendChild(infoRow)

    // Website button
    if (url) {
      const btn = dom.createElement('a')
      btn.href = url.uri || url.value
      btn.target = '_blank'
      btn.textContent = 'Visit Profile →'
      btn.style.cssText = `
        display: inline-block;
        margin-top: 24px;
        padding: 12px 28px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-decoration: none;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.9rem;
        transition: transform 0.2s, box-shadow 0.2s;
      `
      btn.onmouseover = () => {
        btn.style.transform = 'translateY(-2px)'
        btn.style.boxShadow = '0 10px 20px -5px rgba(102, 126, 234, 0.5)'
      }
      btn.onmouseout = () => {
        btn.style.transform = 'translateY(0)'
        btn.style.boxShadow = 'none'
      }
      inner.appendChild(btn)
    }

    card.appendChild(inner)
    div.appendChild(card)

    return div
  }
}

// Register with panes
if (typeof panes !== 'undefined' && panes.register) {
  panes.register(personPane)
}

// Export
if (typeof window !== 'undefined') {
  window.SchemaPersonPane = personPane
}

})();
