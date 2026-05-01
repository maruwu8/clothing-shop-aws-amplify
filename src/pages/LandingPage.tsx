import { Link } from 'react-router-dom';
import heroImg from '../assets/img.png';

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <p className="landing-tagline">the clothing shop</p>
          <h1 className="landing-headline">
            too many things<br />
            you never wear?
          </h1>
          <p className="landing-subtext">
            Give your wardrobe a second life. Sell what you don't wear,
            discover pieces that feel like you. Simple, sustainable, stylish.
          </p>
          <div className="landing-cta">
            <Link to="/home" className="btn btn-primary">shop now</Link>
            <Link to="/register" className="btn btn-secondary">start selling</Link>
          </div>
        </div>
        <div className="landing-hero-image">
          <img src={heroImg} alt="Fashion" />
        </div>
      </section>

      {/* Values Section */}
      <section className="landing-values">
        <div className="landing-value">
          <span className="landing-value-number">01</span>
          <h3>curated for you</h3>
          <p>Browse unique pieces from real people with real style.</p>
        </div>
        <div className="landing-value">
          <span className="landing-value-number">02</span>
          <h3>sell with ease</h3>
          <p>List your items in seconds. We handle the rest.</p>
        </div>
        <div className="landing-value">
          <span className="landing-value-number">03</span>
          <h3>sustainable fashion</h3>
          <p>Every resold piece is one less in a landfill.</p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="landing-bottom">
        <h2>ready to refresh your closet?</h2>
        <p>Join our community of fashion lovers who buy and sell with intention.</p>
        <Link to="/register" className="btn btn-primary">get started</Link>
      </section>
    </div>
  );
}
