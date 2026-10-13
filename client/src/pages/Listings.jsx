import { useEffect } from "react";
import { api } from "../api/client";

export default function Listings() {
  useEffect(() => {
    async function loadlistings() {
      try {
        const data = await api("/api/listings");
        console.log(data);
      } catch (error) {
        console.error(error.message);
      }
    }
    loadlistings();
  }, []);
  return <div>Listings</div>;
}
