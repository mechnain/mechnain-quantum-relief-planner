import { NavLink, Link } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/planner', label: 'Planner' },
  { to: '/results', label: 'Results' },
  { to: '/quantum', label: 'Quantum Demo' },
  { to: '/case-study', label: 'Case Study' },
  { to: '/methods', label: 'Methods' },
  { to: '/about', label: 'About' },
];

export function NavBar() {
  return (
    <header className="nav">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <div className="nav-inner">
        <Link to="/" className="brand" aria-label="Mechnain Labs — home">
          <span className="brand-mark">
            MECHNAIN<span className="accent">·</span>LABS
          </span>
          <span className="brand-sub">Quantum Relief Planner</span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/planner" className="btn btn-primary btn-small nav-cta">
            Start Planning
          </Link>
        </nav>
      </div>
    </header>
  );
}
