import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket";
import { useEffect, useState } from "react";

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
  const [unread, setUnread] = useState(0);
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [prevPathname, setPrevPathname] = useState(pathname);

  const links = user ? privateLinks : publicLinks;

  function handleLogout() {
    logout();
    navigate("/login");
  }
  useEffect(() => {
    if (!user) return;
    function onNewMessage(message) {
      if (message.sender_id === user.id) return;
      if (pathname.startsWith("/messages")) return;
      setUnread((prev) => prev + 1);
    }
    socket.on("new_message", onNewMessage);

    return () => {
      socket.off("new_message", onNewMessage);
    };
  }, [pathname, user]);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (pathname.startsWith("/messages")) {
      setUnread(0);
    }
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
              {path === "/messages" && unread > 0 && (
                <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {unread}
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
