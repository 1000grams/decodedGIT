import React from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function GrowthDashboard({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <div>No analytics data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week_start" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="spotify_streams" stroke="#8884d8" name="Spotify Streams" />
        <Line type="monotone" dataKey="youtube_views" stroke="#82ca9d" name="YouTube Views" />
      </LineChart>
    </ResponsiveContainer>
  );
}
