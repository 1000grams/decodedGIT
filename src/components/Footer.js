import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-6 mt-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          &copy; {new Date().getFullYear()}&nbsp;
          <a
            href="https://decodedmusic.com"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            DecodedMusic.com
          </a>{" "}| Service Provided by AHA LLC
          <br />
          Contact:&nbsp;
          <a href="mailto:ops@decodedmusic.com" className="underline">
            ops@decodedmusic.com
          </a>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <a href="/about" className="underline">
            About Us
          </a>
          <a href="/buzz" className="underline">
            Buzz
          </a>
          <a
            href="/policies.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Terms of Service &amp; Privacy Policy
          </a>
          <a
            href="https://discord.gg/6Txu7wUW"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Discord
          </a>
          <a
            href="https://open.spotify.com/playlist/4BFQN83x5VenHywmXIUC9X"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Productivity Playlist
          </a>
          <a
            href="https://www.youtube.com/@ALGOPLAYLIST"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            YouTube
          </a>
          <a
            href="https://www.youtube.com/@ruedevivre/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Rue De Vivre YouTube
          </a>
          <a
            href="https://www.instagram.com/kaiserinstreetwear/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
