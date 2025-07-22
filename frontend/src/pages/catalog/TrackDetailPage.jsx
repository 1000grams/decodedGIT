import React from "react";

export default function TrackDetailPage({ track }) {
  return (
    <div className="p-4">
      <h2>{track.title}</h2>
      <table className="table-auto">
        <tbody>
          <tr><td>Artist</td><td>{track.artist.name}</td></tr>
          <tr><td>ASCAP Work ID</td><td>{track.ascap.work_id}</td></tr>
          <tr><td>IPI Name</td><td>{track.ascap.ipi_name}</td></tr>
          <tr><td>IPI Base</td><td>{track.ascap.ipi_base_number}</td></tr>
          <tr><td>Publisher</td><td>{track.ascap.publisher}</td></tr>
          {/* Add more metadata fields as needed */}
        </tbody>
      </table>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Submit Pitch
      </button>
    </div>
  );
}
