import React from "react";
import TrackCard from "./TrackCard";

export default function TrackGrid({ tracks = [] }) {
  if (!tracks.length) {
    return (
      <div className="empty-state">
        <p>No data available yet. Connect with Spotify to begin populating your dashboard.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {tracks.map((track) => (
        <TrackCard key={track.track_id} track={track} />
      ))}
    </div>
  );
}
