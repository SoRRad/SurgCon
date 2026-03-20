import { NavLink } from 'react-router-dom';

function SurgConLogo() {
  return (
    <span className="brand__logo" aria-hidden="true">
      <svg viewBox="0 0 64 64" role="presentation">
        <rect x="6" y="6" width="52" height="52" rx="18" />
        <path d="M21 22h16" />
        <path d="M29 14v16" />
        <path d="M20 40h24" />
        <path d="M44 22v18" />
        <circle cx="44" cy="22" r="8" />
        <path d="M40 48h12" />
      </svg>
    </span>
  );
}

function Header({ bookmarkedCount, comparedCount }) {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <NavLink className="brand" to="/">
          <SurgConLogo />
          <span>
            <strong>SurgCon</strong>
            <small>Surgical conference and academic collaboration platform</small>
          </span>
        </NavLink>

        <nav className="site-nav" aria-label="Main navigation">
          <NavLink className={({ isActive }) => (isActive ? 'site-nav__link is-active' : 'site-nav__link')} to="/">
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? 'site-nav__link is-active' : 'site-nav__link')}
            to="/conferences"
          >
            Directory
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? 'site-nav__link is-active' : 'site-nav__link')}
            to="/calendar"
          >
            Calendar
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? 'site-nav__link is-active' : 'site-nav__link')}
            to="/bookmarks"
          >
            Bookmarks
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? 'site-nav__link is-active' : 'site-nav__link')}
            to="/compare"
          >
            Compare
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? 'site-nav__link is-active' : 'site-nav__link')}
            to="/notifications"
          >
            Notifications
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? 'site-nav__link is-active' : 'site-nav__link')}
            to="/add-conference"
          >
            Add Conference
          </NavLink>
        </nav>

        <NavLink className="bookmark-summary" to="/bookmarks">
          <span>Saved</span>
          <strong>{bookmarkedCount}</strong>
        </NavLink>
        <NavLink className="bookmark-summary" to="/compare">
          <span>Compare</span>
          <strong>{comparedCount}</strong>
        </NavLink>
      </div>
    </header>
  );
}

export default Header;
