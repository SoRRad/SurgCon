import { formatDataUpdatedLabel } from '../utils/dateHelpers';

function Footer({ lastUpdated }) {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <strong>SurgCon</strong>
          <p>Curated surgical conference intelligence for academic planning, specialty discovery, deadline tracking, and maintainable static publishing.</p>
        </div>
        <div className="site-footer__meta">
          <span>Last updated: {formatDataUpdatedLabel(lastUpdated)}</span>
          <span>
            Developed by{' '}
            <a href="https://sorrad.github.io/RezaShahriarirad_CV/" target="_blank" rel="noreferrer">
              Reza Shahriarirad
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
