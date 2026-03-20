function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <strong>SurgCon</strong>
          <p>
            Connecting surgical meetings, research communities, and academic collaborators in
            one clear hub.
          </p>
        </div>
        <div className="site-footer__meta">
          <span>Academic calendar, conference discovery, and submission planning.</span>
          <span>{new Date().getFullYear()} SurgCon</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
