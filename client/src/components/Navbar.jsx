import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isLoading } = useAuth();
  console.log(`User: ${user}, Loading: ${isLoading}`)
  const navLinks = [
    { name: "Listings", path: "/listings" },
    { name: "Sell", path: "/listings/new" },
    { name: "My Listings", path: "/my-listings" },
    { name: "Messages", path: "/messages" },
    { name: "Settings", path: "/settings" },
    { name: "Login", path: "/login" },
    { name: "Register", path: "/register" },
  ];
  return (
    <nav className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <Link to="/listings" className="text-xl font-bold text-blue-600">
        Campus Marketplace
      </Link>
      <div className="flex items-center gap-6">
        {navLinks.map(({ name, path }) => (
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
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
