import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <div className="bg-grid" aria-hidden="true" />
      <header className="top">
        <NavLink className="brand" to="/">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">DicomViewer</span>
        </NavLink>
        <nav>
          <a href="/#features">Features</a>
          <a href="/#workflow">Workflow</a>
          <NavLink to="/control" className={({ isActive }) => "nav-admin" + (isActive ? " active" : "")}>
            License gate
          </NavLink>
        </nav>
      </header>
      <Outlet />
      <footer>
        <span>DicomViewer</span>
        <span>Not for primary diagnostic use unless validated by your institution.</span>
      </footer>
    </>
  );
}
