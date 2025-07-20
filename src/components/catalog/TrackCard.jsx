import React from "react";
import { Card, CardContent, CardFooter, Button } from "../ui";

export default function TrackCard({ track }) {
  return (
    <Card>
      <CardContent>
        <audio controls src={track.preview_url} />
        <h3>{track.title}</h3>
        <p>{track.artist.name}</p>
        <p><strong>ASCAP Work ID:</strong> {track.ascap.work_id}</p>
        <p><strong>IPI Base:</strong> {track.ascap.ipi_base_number}</p>
      </CardContent>
      <CardFooter>
        <Button as="a" href={`/tracks/${track.track_id}`}>Details</Button>
      </CardFooter>
    </Card>
  );
}
