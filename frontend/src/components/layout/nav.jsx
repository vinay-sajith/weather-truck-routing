import "./nav.css";
import logo from "../../assets/logo.svg";


function Navbar({
  onPlanRouteClick,
  onRouteOptionsClick,
  onWeatherClick,
}) {
  return (
    <header className="navbar">
     <div className="brand">
        <img src={logo} alt="GoRoute logo" className="brand-logo" />
        <span>GoRoute</span>
        </div>

      <nav className="nav-links">
  <a
    href="#plan"
    className="active"
    onClick={(event) => {
      event.preventDefault();
      onPlanRouteClick();
    }}
  >
    Plan Route
  </a>

  <a
    href="#route-options"
    onClick={(event) => {
      event.preventDefault();
      onRouteOptionsClick();
    }}
  >
    Route Options
  </a>

  <a
    href="#weather"
    onClick={(event) => {
      event.preventDefault();
      onWeatherClick();
    }}
  >
    Weather
  </a>
</nav>
      <div className="status">
        <span className="status-dot"></span>
        Route Safety
      </div>
    </header>
  );
}

export default Navbar;
