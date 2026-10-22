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
    <nav className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <Link to="/listings" className="text-xl font-bold text-blue-600">
        Campus Marketplace
      </Link>

      {!isLoading && (
        <div className="flex items-center gap-6">
          {links.map(({ name, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/listings"}
              className={({ isActive }) =>
                `transition-colors ${
                  isActive
                    ? "font-semibold text-blue-600"
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
              onClick={handleLogout}
              className="text-gray-500 transition-colors hover:text-red-600"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
