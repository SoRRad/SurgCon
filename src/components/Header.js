import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Directory', to: '/conferences' },
  { label: 'Calendar', to: '/calendar' },
  { label: 'Submit Conference', to: '/submit' },
];

function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <NavLink className="brand" to="/">
          <span className="brand__mark">SC</span>
          <span>
            <strong>SurgCon</strong>
            <small>A surgical conference and academic collaboration platform</small>
          </span>
        </NavLink>

        <nav className="site-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'site-nav__link is-active' : 'site-nav__link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
