import React from "react";
export default function SearchBar() {
  return (
    <input
      type="text"
      placeholder="Search by title, artist, or tags"
      className="w-full p-2 border rounded mb-4"
    />
  );
}
