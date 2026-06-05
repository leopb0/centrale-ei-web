import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="Header-container">
      <span className="Header-brand">CinéRéférence</span>
      <nav className="Header-nav">
        <Link className="Link" to="/browse">Accueil</Link>
        <Link className="Link" to="/">Recherche</Link>
        <Link className="Link" to="/recommendations">Recommandations</Link>
        <Link className="Link" to="/liked">Mes likes</Link>
        <Link className="Link Link--icon" to="/users" title="Utilisateurs">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 12c2.67 0 8 1.34 8 4v2H4v-2c0-2.66 5.33-4 8-4zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
          </svg>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
