import { Routes, Route, Navigate } from "react-router-dom";
import Listings from "./pages/Listings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import Messages from "./pages/Messages";
import ListingDetail from "./pages/ListingDetail";
import MyListings from "./pages/MyListings";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import NewListing from "./pages/NewListing";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/listings" replace />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/new" element={<NewListing />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:conversationId" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
