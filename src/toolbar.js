/**
 * SchemaPanes Toolbar
 * Core toolbar with authentication, edit mode, and actions
 */

(function() {
'use strict';

const Toolbar = {
  name: 'toolbar',

  // Icons as inline SVG
  icons: {
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>',
    login: '<svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>',
    logout: '<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    view: '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>',
    delete: '<svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    refresh: '<svg viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
    source: '<svg viewBox="0 0 24 24"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>',
    data: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
    newResource: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    folder: '<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
  },

  // State
  state: {
    user: null,
    editMode: false,
    currentView: 'profile'
  },

  // Create toolbar element
  render: function(options = {}) {
    const dom = options.dom || document
    const subject = options.subject
    const onViewChange = options.onViewChange || (() => {})
    const onRefresh = options.onRefresh || (() => window.location.reload())
    const theme = options.theme || { primary: '#667eea', bg: '#eff6ff' }

    const toolbar = dom.createElement('div')
    toolbar.className = 'schema-toolbar'
    toolbar.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      font-family: system-ui, -apple-system, sans-serif;
    `

    // Add CSS for toolbar icons
    const style = dom.createElement('style')
    style.textContent = `
      .schema-toolbar-icon {
        width: 32px;
        height: 32px;
        padding: 6px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        transition: background 0.15s;
      }
      .schema-toolbar-icon:hover { background: #f1f5f9; }
      .schema-toolbar-icon.active { background: ${theme.bg}; }
      .schema-toolbar-icon svg {
        width: 18px;
        height: 18px;
        stroke: #64748b;
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .schema-toolbar-icon.active svg { stroke: ${theme.primary}; }
      .schema-toolbar-icon:disabled { opacity: 0.4; cursor: not-allowed; }
      .schema-toolbar-icon:disabled:hover { background: transparent; }
      .schema-toolbar-divider {
        width: 1px;
        height: 24px;
        background: #e2e8f0;
        margin: 0 4px;
      }
      .schema-toolbar-spacer { flex: 1; }
      .schema-toolbar-user {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        border-radius: 20px;
        background: #f8fafc;
        font-size: 0.85rem;
        color: #475569;
      }
      .schema-toolbar-user img {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
      }
      .schema-toolbar-url {
        font-size: 0.8rem;
        color: #94a3b8;
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `
    toolbar.appendChild(style)

    // Helper to create icon button
    const createIcon = (name, title, onClick, active = false) => {
      const btn = dom.createElement('button')
      btn.className = 'schema-toolbar-icon' + (active ? ' active' : '')
      btn.title = title
      btn.innerHTML = this.icons[name]
      btn.onclick = onClick
      return btn
    }

    const createDivider = () => {
      const div = dom.createElement('div')
      div.className = 'schema-toolbar-divider'
      return div
    }

    // View buttons
    const viewBtn = createIcon('view', 'View', () => {
      this.state.currentView = 'profile'
      updateViewButtons()
      onViewChange('profile')
    }, true)
    viewBtn.dataset.view = 'profile'
    toolbar.appendChild(viewBtn)

    const dataBtn = createIcon('data', 'Data', () => {
      this.state.currentView = 'data'
      updateViewButtons()
      onViewChange('data')
    })
    dataBtn.dataset.view = 'data'
    toolbar.appendChild(dataBtn)

    const sourceBtn = createIcon('source', 'Source', () => {
      this.state.currentView = 'source'
      updateViewButtons()
      onViewChange('source')
    })
    sourceBtn.dataset.view = 'source'
    toolbar.appendChild(sourceBtn)

    const updateViewButtons = () => {
      [viewBtn, dataBtn, sourceBtn].forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === this.state.currentView)
      })
    }

    toolbar.appendChild(createDivider())

    // Edit mode toggle
    const editBtn = createIcon('edit', 'Edit mode', () => {
      this.state.editMode = !this.state.editMode
      editBtn.classList.toggle('active', this.state.editMode)
      if (options.onEditToggle) {
        options.onEditToggle(this.state.editMode)
      }
    })
    toolbar.appendChild(editBtn)

    // Refresh
    toolbar.appendChild(createIcon('refresh', 'Refresh', onRefresh))

    toolbar.appendChild(createDivider())

    // Share (requires auth)
    const shareBtn = createIcon('share', 'Share', () => {
      if (!this.state.user) {
        alert('Please log in to manage sharing')
        return
      }
      if (options.onShare) {
        options.onShare()
      } else {
        alert('Sharing not yet implemented')
      }
    })
    toolbar.appendChild(shareBtn)

    // Delete (requires auth)
    const deleteBtn = createIcon('delete', 'Delete', () => {
      if (!this.state.user) {
        alert('Please log in to delete')
        return
      }
      if (confirm('Delete this resource?')) {
        if (options.onDelete) {
          options.onDelete()
        }
      }
    })
    toolbar.appendChild(deleteBtn)

    // Spacer
    const spacer = dom.createElement('div')
    spacer.className = 'schema-toolbar-spacer'
    toolbar.appendChild(spacer)

    // URL display
    if (subject) {
      const url = dom.createElement('div')
      url.className = 'schema-toolbar-url'
      url.textContent = subject.value || subject
      url.title = subject.value || subject
      toolbar.appendChild(url)
    }

    toolbar.appendChild(createDivider())

    // User area
    const userArea = dom.createElement('div')
    userArea.id = 'toolbar-user-area'

    const self = this
    const updateUserArea = () => {
      userArea.innerHTML = ''
      if (self.state.user) {
        const userDiv = dom.createElement('div')
        userDiv.className = 'schema-toolbar-user'
        if (self.state.user.image) {
          const img = dom.createElement('img')
          img.src = self.state.user.image
          img.onerror = () => { img.style.display = 'none' }
          userDiv.appendChild(img)
        }
        const name = dom.createElement('span')
        name.textContent = self.state.user.name || 'Logged in'
        userDiv.appendChild(name)
        userArea.appendChild(userDiv)

        const logoutBtn = createIcon('logout', 'Log out', async () => {
          await self.logout(updateUserArea)
        })
        userArea.appendChild(logoutBtn)
      } else {
        // Create a more visible login button with text
        const loginBtn = dom.createElement('button')
        loginBtn.className = 'schema-toolbar-login'
        loginBtn.title = 'Log in with your Solid Pod'
        loginBtn.innerHTML = `
          <svg viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;margin-right:6px;">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
          </svg>
          Log in
        `
        loginBtn.style.cssText = `
          display: flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #475569;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
        `
        loginBtn.onmouseover = () => {
          loginBtn.style.background = '#f8fafc'
          loginBtn.style.borderColor = '#cbd5e1'
        }
        loginBtn.onmouseout = () => {
          loginBtn.style.background = 'white'
          loginBtn.style.borderColor = '#e2e8f0'
        }
        loginBtn.onclick = async () => {
          await self.login(updateUserArea)
        }
        userArea.appendChild(loginBtn)
      }
    }

    userArea.style.cssText = 'display: flex; align-items: center; gap: 8px;'
    toolbar.appendChild(userArea)

    // Always render login button first, then check session
    updateUserArea()

    // Check if already logged in (will update UI if so)
    this.checkSession().then(() => updateUserArea()).catch(() => updateUserArea())

    return toolbar
  },

  // Authentication methods
  async checkSession() {
    try {
      if (typeof SolidLogic !== 'undefined') {
        // Check if already logged in via mashlib
        const webId = SolidLogic.authn.currentUser()
        if (webId) {
          this.state.user = { webId: webId.value || webId }
          await this.fetchProfile(webId.value || webId)
          return true
        }
      }
    } catch (e) {
      console.log('Session check:', e)
    }
    return false
  },

  async fetchProfile(webId) {
    try {
      if (typeof SolidLogic !== 'undefined' && typeof $rdf !== 'undefined') {
        const store = SolidLogic.store
        const user = $rdf.sym(webId)
        const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/')
        const VCARD = $rdf.Namespace('http://www.w3.org/2006/vcard/ns#')

        await store.fetcher.load(user.doc())

        const name = store.anyValue(user, FOAF('name')) ||
                     store.anyValue(user, VCARD('fn')) ||
                     webId.split('/').pop().replace('#me', '').replace('#i', '')
        const image = store.any(user, FOAF('img')) ||
                      store.any(user, VCARD('hasPhoto'))

        this.state.user.name = name
        if (image) this.state.user.image = image.value
      }
    } catch (e) {
      console.log('Could not fetch profile:', e)
      // Use WebID as fallback name
      if (this.state.user && !this.state.user.name) {
        this.state.user.name = webId.split('/')[2] // domain as name
      }
    }
  },

  // Show username prompt for provider
  showUsernamePrompt(provider, updateCallback, backdrop) {
    const self = this
    const dom = document

    // Replace modal content with username prompt
    const modal = backdrop.querySelector('div')
    modal.innerHTML = ''

    // Add back animation styles
    const style = dom.createElement('style')
    style.textContent = `
      @keyframes modalIn {
        from { opacity: 0; transform: scale(0.95) translateY(-10px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
    `
    modal.appendChild(style)

    // Header
    const header = dom.createElement('div')
    header.style.cssText = 'padding: 24px 24px 0; text-align: center;'
    header.innerHTML = `
      <div style="width: 56px; height: 56px; background: ${provider.color}; border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; stroke: white; fill: none; stroke-width: 2;">
          <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
        </svg>
      </div>
      <h2 style="margin: 0 0 8px; font-size: 1.25rem; font-weight: 600; color: #1e293b;">Log in to ${provider.name}</h2>
      <p style="margin: 0; font-size: 0.9rem; color: #64748b;">Enter your username</p>
    `
    modal.appendChild(header)

    // Username input
    const form = dom.createElement('div')
    form.style.cssText = 'padding: 24px;'

    const inputWrapper = dom.createElement('div')
    inputWrapper.style.cssText = `
      display: flex;
      align-items: center;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      padding: 2px;
      transition: border-color 0.15s, box-shadow 0.15s;
    `

    const input = dom.createElement('input')
    input.type = 'text'
    input.placeholder = 'username'
    input.style.cssText = `
      flex: 1;
      padding: 12px 14px;
      border: none;
      font-size: 1rem;
      font-family: inherit;
      outline: none;
      background: transparent;
    `

    const suffix = dom.createElement('span')
    suffix.textContent = '.' + provider.name
    suffix.style.cssText = `
      padding: 12px 14px;
      color: #64748b;
      font-size: 0.95rem;
      background: #f8fafc;
      border-radius: 8px;
    `

    inputWrapper.appendChild(input)
    inputWrapper.appendChild(suffix)

    input.onfocus = () => {
      inputWrapper.style.borderColor = provider.color
      inputWrapper.style.boxShadow = `0 0 0 3px ${provider.color}20`
    }
    input.onblur = () => {
      inputWrapper.style.borderColor = '#e2e8f0'
      inputWrapper.style.boxShadow = 'none'
    }

    form.appendChild(inputWrapper)

    // Preview
    const preview = dom.createElement('div')
    preview.style.cssText = `
      margin-top: 12px;
      padding: 10px 14px;
      background: #f8fafc;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #64748b;
      word-break: break-all;
    `
    preview.innerHTML = `Your Pod: <span style="color: #334155;">https://<span id="username-preview">username</span>.${provider.name}</span>`
    form.appendChild(preview)

    input.oninput = () => {
      const previewEl = preview.querySelector('#username-preview')
      previewEl.textContent = input.value || 'username'
    }

    // Login button
    const loginBtn = dom.createElement('button')
    loginBtn.textContent = 'Continue to Login'
    loginBtn.style.cssText = `
      width: 100%;
      margin-top: 20px;
      padding: 14px 24px;
      background: ${provider.color};
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      font-family: inherit;
      transition: opacity 0.15s;
    `
    loginBtn.onmouseover = () => loginBtn.style.opacity = '0.9'
    loginBtn.onmouseout = () => loginBtn.style.opacity = '1'
    loginBtn.onclick = () => {
      if (input.value.trim()) {
        const podUrl = `https://${input.value.trim()}.${provider.name}`
        self.loginWithProvider(podUrl, updateCallback, backdrop)
      }
    }
    form.appendChild(loginBtn)

    input.onkeydown = (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        loginBtn.click()
      }
    }

    modal.appendChild(form)

    // Back button
    const footer = dom.createElement('div')
    footer.style.cssText = `
      padding: 16px 24px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      text-align: center;
    `
    const backBtn = dom.createElement('button')
    backBtn.innerHTML = `
      <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 2; margin-right: 6px; vertical-align: middle;">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      Back to providers
    `
    backBtn.style.cssText = `
      padding: 8px 16px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.85rem;
      color: #64748b;
      cursor: pointer;
      font-family: inherit;
    `
    backBtn.onclick = () => {
      backdrop.remove()
      self.showLoginModal(updateCallback)
    }
    footer.appendChild(backBtn)
    modal.appendChild(footer)

    input.focus()
  },

  // Show login modal
  showLoginModal(updateCallback) {
    const self = this
    const dom = document

    // Remove existing modal if any
    const existing = dom.getElementById('solid-login-modal')
    if (existing) existing.remove()

    // Create modal backdrop
    const backdrop = dom.createElement('div')
    backdrop.id = 'solid-login-modal'
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
    `

    // Create modal
    const modal = dom.createElement('div')
    modal.style.cssText = `
      background: white;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      width: 100%;
      max-width: 400px;
      margin: 16px;
      overflow: hidden;
      animation: modalIn 0.2s ease-out;
    `

    // Add animation
    const style = dom.createElement('style')
    style.textContent = `
      @keyframes modalIn {
        from { opacity: 0; transform: scale(0.95) translateY(-10px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .solid-provider-btn:hover {
        background: #f8fafc !important;
        border-color: #cbd5e1 !important;
      }
      .solid-provider-btn:focus {
        outline: none;
        border-color: #667eea !important;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
      }
    `
    modal.appendChild(style)

    // Header
    const header = dom.createElement('div')
    header.style.cssText = `
      padding: 24px 24px 0;
      text-align: center;
    `
    header.innerHTML = `
      <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 14px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <svg viewBox="0 0 24 24" style="width: 28px; height: 28px; stroke: white; fill: none; stroke-width: 2;">
          <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
        </svg>
      </div>
      <h2 style="margin: 0 0 8px; font-size: 1.25rem; font-weight: 600; color: #1e293b;">Log in with Solid</h2>
      <p style="margin: 0; font-size: 0.9rem; color: #64748b;">Choose your identity provider</p>
    `
    modal.appendChild(header)

    // Providers
    const providers = dom.createElement('div')
    providers.style.cssText = 'padding: 20px 24px;'

    const providerList = [
      { name: 'solidcommunity.net', url: 'https://solidcommunity.net', color: '#7c3aed' },
      { name: 'inrupt.net', url: 'https://inrupt.net', color: '#0ea5e9' },
      { name: 'solidweb.org', url: 'https://solidweb.org', color: '#10b981' },
      { name: 'solidweb.me', url: 'https://solidweb.me', color: '#f59e0b' }
    ]

    providerList.forEach(provider => {
      const btn = dom.createElement('button')
      btn.className = 'solid-provider-btn'
      btn.style.cssText = `
        display: flex;
        align-items: center;
        width: 100%;
        padding: 12px 16px;
        margin-bottom: 8px;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: white;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.95rem;
        color: #334155;
        transition: all 0.15s;
      `
      btn.innerHTML = `
        <span style="width: 10px; height: 10px; border-radius: 50%; background: ${provider.color}; margin-right: 12px;"></span>
        <span style="flex: 1; text-align: left;">${provider.name}</span>
        <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; stroke: #94a3b8; fill: none; stroke-width: 2;">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      `
      btn.onclick = () => {
        // Ask for username to construct proper Pod URL
        self.showUsernamePrompt(provider, updateCallback, backdrop)
      }
      providers.appendChild(btn)
    })

    modal.appendChild(providers)

    // Custom provider input
    const custom = dom.createElement('div')
    custom.style.cssText = `
      padding: 0 24px 20px;
      border-top: 1px solid #e2e8f0;
      margin-top: 4px;
      padding-top: 20px;
    `
    custom.innerHTML = `
      <label style="display: block; font-size: 0.8rem; font-weight: 500; color: #64748b; margin-bottom: 8px;">
        Or enter your Pod URL / WebID
      </label>
    `

    const inputRow = dom.createElement('div')
    inputRow.style.cssText = 'display: flex; gap: 8px;'

    const input = dom.createElement('input')
    input.type = 'url'
    input.placeholder = 'https://you.example.org'
    input.style.cssText = `
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    `
    input.onfocus = () => {
      input.style.borderColor = '#667eea'
      input.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.2)'
    }
    input.onblur = () => {
      input.style.borderColor = '#e2e8f0'
      input.style.boxShadow = 'none'
    }
    input.onkeydown = (e) => {
      if (e.key === 'Enter' && input.value) {
        self.loginWithProvider(input.value, updateCallback, backdrop)
      }
    }
    inputRow.appendChild(input)

    const goBtn = dom.createElement('button')
    goBtn.textContent = 'Go'
    goBtn.style.cssText = `
      padding: 10px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      font-family: inherit;
      transition: opacity 0.15s;
    `
    goBtn.onmouseover = () => goBtn.style.opacity = '0.9'
    goBtn.onmouseout = () => goBtn.style.opacity = '1'
    goBtn.onclick = () => {
      if (input.value) {
        self.loginWithProvider(input.value, updateCallback, backdrop)
      }
    }
    inputRow.appendChild(goBtn)

    custom.appendChild(inputRow)
    modal.appendChild(custom)

    // Footer
    const footer = dom.createElement('div')
    footer.style.cssText = `
      padding: 16px 24px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `
    footer.innerHTML = `
      <a href="https://solidproject.org/users/get-a-pod" target="_blank" style="font-size: 0.85rem; color: #667eea; text-decoration: none;">
        Get a Pod →
      </a>
    `

    const cancelBtn = dom.createElement('button')
    cancelBtn.textContent = 'Cancel'
    cancelBtn.style.cssText = `
      padding: 8px 16px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.85rem;
      color: #64748b;
      cursor: pointer;
      font-family: inherit;
    `
    cancelBtn.onclick = () => backdrop.remove()
    footer.appendChild(cancelBtn)

    modal.appendChild(footer)
    backdrop.appendChild(modal)

    // Close on backdrop click
    backdrop.onclick = (e) => {
      if (e.target === backdrop) backdrop.remove()
    }

    // Close on escape
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        backdrop.remove()
        dom.removeEventListener('keydown', escHandler)
      }
    }
    dom.addEventListener('keydown', escHandler)

    dom.body.appendChild(backdrop)
    input.focus()
  },

  async loginWithProvider(providerUrl, updateCallback, modal) {
    const self = this

    // Normalize URL
    let url = providerUrl.trim()
    if (!url.startsWith('http')) {
      url = 'https://' + url
    }

    // Show loading state
    if (modal) {
      const loadingOverlay = document.createElement('div')
      loadingOverlay.id = 'login-loading'
      loadingOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255,255,255,0.9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 16px;
      `
      loadingOverlay.innerHTML = `
        <div style="width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #667eea; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <div style="margin-top: 16px; color: #64748b; font-size: 0.9rem;">Connecting...</div>
        <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
      `
      modal.querySelector('div > div').style.position = 'relative'
      modal.querySelector('div > div').appendChild(loadingOverlay)
    }

    try {
      // Open login page in popup
      const loginUrl = url.includes('/profile/card')
        ? url.replace(/\/profile\/card.*/, '/.account/login/password/')
        : url + '/.account/login/password/'

      const loginWindow = window.open(
        loginUrl,
        'solid-login',
        'width=500,height=650,left=200,top=100'
      )

      // Poll for login completion
      let attempts = 0
      const maxAttempts = 120 // 2 minutes

      const checkLogin = setInterval(async () => {
        attempts++

        try {
          // Check if logged in
          if (typeof SolidLogic !== 'undefined') {
            const user = SolidLogic.authn.currentUser()
            if (user) {
              clearInterval(checkLogin)
              if (loginWindow && !loginWindow.closed) loginWindow.close()
              if (modal) modal.remove()

              self.state.user = { webId: user.value || user }
              await self.fetchProfile(user.value || user)
              if (updateCallback) updateCallback()
              return
            }
          }

          // Check if popup was closed
          if (loginWindow && loginWindow.closed) {
            clearInterval(checkLogin)
            // Try to fetch the pod to trigger auth cookie detection
            setTimeout(async () => {
              try {
                // Fetch the provider to pick up auth cookies
                await fetch(url + '/profile/card', { credentials: 'include' })

                // Try fetcher to trigger auth
                if (typeof SolidLogic !== 'undefined') {
                  const profileDoc = $rdf.sym(url + '/profile/card')
                  await SolidLogic.store.fetcher.load(profileDoc)
                }

                // Check for user again
                const user = SolidLogic.authn?.currentUser()
                if (user) {
                  if (modal) modal.remove()
                  self.state.user = { webId: user.value || user }
                  await self.fetchProfile(user.value || user)
                  if (updateCallback) updateCallback()
                } else {
                  // Still no user - try to find WebID from store
                  const store = SolidLogic.store
                  const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/')
                  const profileDoc = $rdf.sym(url + '/profile/card')
                  const maker = store.any(profileDoc, FOAF('maker'))
                  const primaryTopic = store.any(profileDoc, FOAF('primaryTopic'))
                  const webId = maker || primaryTopic

                  if (webId) {
                    if (modal) modal.remove()
                    self.state.user = { webId: webId.value }
                    await self.fetchProfile(webId.value)
                    if (updateCallback) updateCallback()
                  } else {
                    // Remove loading state - login may have failed
                    const loading = document.getElementById('login-loading')
                    if (loading) loading.remove()
                  }
                }
              } catch (e) {
                console.log('Post-login check error:', e)
                const loading = document.getElementById('login-loading')
                if (loading) loading.remove()
              }
            }, 1000)
          }

          // Timeout
          if (attempts >= maxAttempts) {
            clearInterval(checkLogin)
            const loading = document.getElementById('login-loading')
            if (loading) loading.remove()
          }
        } catch (e) {
          console.log('Login check error:', e)
        }
      }, 1000)

    } catch (e) {
      console.error('Login error:', e)
      const loading = document.getElementById('login-loading')
      if (loading) loading.remove()
      alert('Could not connect to ' + url)
    }
  },

  async login(updateCallback) {
    this.showLoginModal(updateCallback)
  },

  async logout(updateCallback) {
    try {
      if (typeof SolidLogic !== 'undefined' && SolidLogic.authn) {
        await SolidLogic.authn.logout()
      }
      this.state.user = null
      if (updateCallback) updateCallback()
    } catch (e) {
      console.error('Logout error:', e)
      this.state.user = null
      if (updateCallback) updateCallback()
    }
  }
}

// Export
if (typeof window !== 'undefined') {
  window.SchemaToolbar = Toolbar
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Toolbar
}

})();
