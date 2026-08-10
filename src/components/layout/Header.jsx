// Header / Top Navbar Admin
const Header = ({ pageTitle = 'Dashboard' }) => {
  return (
    <header className="header">
      <h1 className="header-title">{pageTitle}</h1>
      <div className="header-actions">
        <button className="header-notif">🔔</button>
        <div className="header-profile">
          <span className="profile-avatar">👤</span>
          <span className="profile-name">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
