import React, { useState } from 'react';
import Dashboard from './Dashboard';
import StockAudit from './StockAudit';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  // Switcher logic to show the correct component
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'audit':
        return <StockAudit />;
      default:
        return <Dashboard />;
    }
  };

  // Helper to style the sidebar buttons dynamically
  const getButtonStyle = (pageName) => ({
    width: '100%', // Full width of the sidebar
    background: activePage === pageName ? '#0088FE' : 'transparent', // Blue if active
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: activePage === pageName ? 'bold' : 'normal',
    marginBottom: '10px', // Spacing between buttons
    transition: 'background 0.2s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  });

  return (
    // 1. Main Container: Flex Row (Left Sidebar | Right Content)
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* 2. LEFT SIDEBAR */}
      <nav style={{ 
        width: '260px', 
        background: '#1e2130', // Dark modern background
        color: 'white',
        display: 'flex', 
        flexDirection: 'column',
        padding: '25px',
        boxShadow: '4px 0 10px rgba(0,0,0,0.1)', // Subtle shadow on the right
        zIndex: 10
      }}>
        
        {/* Logo / Header Area */}
        <div style={{ marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #333' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>Inventory</h2>
          <small style={{ color: '#888', fontSize: '0.85rem' }}>Odoo Hackathon v1.0</small>
        </div>

        {/* Menu Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          <button 
            onClick={() => setActivePage('audit')}
            style={getButtonStyle('audit')}
          >
            <span>📝</span> Audit & Ledger
          </button>

          <button 
            onClick={() => setActivePage('dashboard')}
            style={getButtonStyle('dashboard')}
          >
            <span>📊</span> BI Dashboard
          </button>
        </div>

      </nav>

      {/* 3. RIGHT MAIN CONTENT */}
      <main style={{ 
        flex: 1, // Takes up all remaining space
        background: '#f0f2f5', // Light gray background for content
        padding: '40px',
        overflowY: 'auto', // Adds scroll to content only, not sidebar
        height: '100vh',
        boxSizing: 'border-box'
      }}>
        {renderPage()}
      </main>

    </div>
  );
}

export default App;