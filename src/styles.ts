/**
 * Styles for the data browser layout
 * Compatible with mashlib's mashStyle interface
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
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
    padding: 8px 16px;
  `.trim().replace(/\s+/g, ' '),

  dbLayoutFooter: `
    flex: 0 0 auto;
    background: #f5f5f5;
    border-top: 1px solid #ddd;
    padding: 8px 16px;
    font-size: 12px;
  `.trim().replace(/\s+/g, ' '),

  dbLayoutContent: `
    flex: 1 1 auto;
    overflow: auto;
    padding: 16px;
  `.trim().replace(/\s+/g, ' ')
}

export default shimStyle
