import { Routes, Route, Navigate } from "react-router-dom";
import Listings from "./pages/Listings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import Messages from "./pages/Messages";
import MessagesLayout from "./pages/MessagesLayout";
import ListingDetail from "./pages/ListingDetail";
import MyListings from "./pages/MyListings";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import NewListing from "./pages/NewListing";
import EditListing from "./pages/EditListing";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/listings" replace />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/listings/new" element={<NewListing />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/listings/:id/edit" element={<EditListing />} />
          <Route path="/messages" element={<MessagesLayout />}>
            <Route index element={<Messages />} />
            <Route path=":conversationId" element={<Chat />} />
          </Route>
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
