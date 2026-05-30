import { Link } from "react-router-dom";

const defaultHighlights = [
  { value: "24/7", label: "Smart search support" },
  { value: "99.9%", label: "Workspace uptime" },
  { value: "1 tap", label: "Fast team access" },
];

function AuthLayout({
  pageClassName = "",
  eyebrow,
  title,
  description,
  alternateLabel,
  alternateTo,
  alternateCta,
  sideLabel,
  sideTitle,
  sideText,
  features = [],
  highlights = defaultHighlights,
  children,
}) {
  return (
    <main className={`auth-page ${pageClassName}`.trim()}>
      <div className="auth-page__mesh" />
      <div className="auth-page__grid" />

      <section className="auth-shell">
        <div className="auth-shell__showcase">
          <div className="auth-shell__orbit auth-shell__orbit--one" />
          <div className="auth-shell__orbit auth-shell__orbit--two" />
          <div className="auth-shell__glow auth-shell__glow--top" />
          <div className="auth-shell__glow auth-shell__glow--bottom" />

          <div className="auth-shell__content">
            <span className="auth-pill">{sideLabel}</span>
            <h1 className="auth-shell__headline">{sideTitle}</h1>
            <p className="auth-shell__summary">{sideText}</p>

            <div className="auth-highlight-grid">
              {highlights.map((item) => (
                <article className="auth-highlight-card" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>

            <div className="auth-feature-list">
              {features.map((feature) => (
                <div className="auth-feature-item" key={feature}>
                  <span className="auth-feature-item__dot" />
                  <p>{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card__header">
            <span className="auth-card__eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>

          {children}

          <p className="auth-card__alternate">
            {alternateLabel} <Link to={alternateTo}>{alternateCta}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
