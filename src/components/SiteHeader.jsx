import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/search', label: 'Busca' },
  { to: '/map', label: 'Mapa' },
  { to: '/as/28513', label: 'Detalhe AS' },
  { to: '/admin', label: 'Gerenciar AS' },
  { to: '/about', label: 'Sobre' },
  { to: '/contact', label: 'Contato' }
];

export function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner container-wide">
          <NavLink to="/" className="brand" onClick={() => setDrawerOpen(false)}>
            <span className="brand-mark">G</span>
            <span>
              <strong>Geo Route</strong>
              <small>Rotas BGP entre AS</small>
            </span>
          </NavLink>

          <nav className="header-links" aria-label="Navegação principal">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `header-link${isActive ? ' active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button type="button" className="menu-button" onClick={() => setDrawerOpen(true)} aria-label="Abrir menu">
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`drawer-backdrop${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`drawer${drawerOpen ? ' open' : ''}`} aria-hidden={!drawerOpen}>
        <div className="drawer-head">
          <strong>Geo Route</strong>
          <button type="button" className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Fechar menu">
            ×
          </button>
        </div>
        <nav className="drawer-nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `drawer-link${isActive ? ' active' : ''}`}
              onClick={() => setDrawerOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}