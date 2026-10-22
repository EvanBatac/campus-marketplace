import { useRef, useState } from "react";
import { useToast } from "../hooks/useToast";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUnread } from "../context/UnreadContext";

const publicLinks = [
  { name: "Listings", path: "/listings" },
  { name: "Login", path: "/login" },
  { name: "Register", path: "/register" },
];

const privateLinks = [
  { name: "Listings", path: "/listings" },
  { name: "Sell", path: "/listings/new" },
  { name: "My Listings", path: "/my-listings" },
  { name: "Messages", path: "/messages" },
  { name: "Settings", path: "/settings" },
];

export default function Navbar() {
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const { totalUnread } = useUnread();
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const links = user ? privateLinks : publicLinks;

  function handleLogout() {
    logout();
    toast.success("You’ve been logged out.");
    navigate("/login");
  }
  return (
    <nav
      aria-label="Main navigation"
      className="relative z-30 border-b border-slate-200 bg-white px-4 sm:px-6"
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          menuButtonRef.current?.focus();
        }
      }}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-3">
        <Link
          to="/listings"
          onClick={() => setMenuOpen(false)}
          className="rounded text-lg font-bold text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 sm:text-xl"
        >
          Campus Marketplace
        </Link>

        {!isLoading && (
          <>
            <button
              ref={menuButtonRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="navigation-links"
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 lg:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  d={
                    menuOpen
                      ? "m6 6 12 12M6 18 18 6"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
            <div
              id="navigation-links"
              className={`${menuOpen ? "flex" : "hidden"} absolute top-full right-0 left-0 flex-col gap-1 border-b border-slate-200 bg-white p-4 shadow-lg lg:static lg:flex lg:flex-row lg:items-center lg:gap-2 lg:border-0 lg:p-0 lg:shadow-none`}
            >
              {links.map(({ name, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === "/listings"}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                      isActive
                        ? "bg-blue-50 font-semibold text-blue-600"
                        : "text-gray-500 hover:text-blue-600"
                    }`
                  }
                >
                  {name}
                  {path === "/messages" && totalUnread > 0 && (
                    <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                      {totalUnread}
                    </span>
                  )}
                </NavLink>
              ))}

              {user && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="rounded-lg px-3 py-2.5 text-left text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-red-600"
                >
                  Logout
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
