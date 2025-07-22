import React from "react";

export default function About() {
  return (
    <div
      className="max-w-3xl mx-auto p-8"
      style={{
        fontFamily: "Georgia, serif",
        background: "linear-gradient(135deg, #111827 0%, #1e293b 100%)",
        minHeight: "100vh",
        color: "#fff",
        boxShadow: "0 8px 32px #0004",
      }}
    >
      <section
        className="mb-10"
        style={{
          borderBottom: "2px solid #2563eb",
          paddingBottom: "2.5rem",
        }}
      >
        <h1
          className="text-6xl font-extrabold mb-8 text-center"
          style={{
            letterSpacing: "0.03em",
            fontFamily: "Georgia, serif",
            color: "#fff",
            textShadow: "0 4px 24px #2563eb99, 0 1.5px 0 #fff2",
            fontSize: "3.2rem",
            fontWeight: 900,
            marginBottom: 24,
          }}
        >
          Behind every chart-topping hook is a tangle of metadata, royalties, and
          curator paywalls.
        </h1>
        <p
          className="text-2xl text-gray-700 text-center max-w-2xl mx-auto"
          style={{
            marginBottom: "2rem",
            color: "#e0e7ef",
            fontSize: "1.5rem",
            fontWeight: 500,
          }}
        >
          We strip away the noise—translating spreadsheets into strategy,
          contracts into career leverage, and playlists into lasting fanbases.
        </p>
        <p
          className="text-xl text-gray-500 text-center max-w-xl mx-auto"
          style={{
            fontStyle: "italic",
            color: "#60a5fa",
            fontSize: "1.25rem",
          }}
        >
          Because music should feel limitless, not labyrinthine.
        </p>
      </section>
      <section className="mb-10 flex justify-center">
        <blockquote
          className="border-l-4 border-blue-500 pl-6 pr-4 py-4 bg-blue-50 rounded-lg shadow-md"
          style={{
            fontSize: "1.7rem",
            fontFamily: "Georgia, serif",
            maxWidth: 700,
            margin: "0 auto",
            color: "#e0e7ef",
            background: "#222b3a",
            borderLeft: "6px solid #2563eb",
            borderRadius: 16,
            boxShadow: "0 2px 12px #2563eb33",
            padding: "2.5rem 2.5rem 2.5rem 2.5rem", // Equal vertical and horizontal padding
            lineHeight: 1.7, // More readable line spacing
            letterSpacing: "0.01em",
          }}
        >
          <span
            style={{
              fontSize: "3rem",
              verticalAlign: "top",
              color: "#2563eb",
              fontWeight: "bold",
              marginRight: 8,
              lineHeight: 1,
            }}
          >
            &ldquo;
          </span>
          I built Decoded after watching brilliant artists drown in bad data and
          worse contracts. Our mission is simple: give creators the same forensic
          clarity Fortune 500s expect—served with indie-label heart.
          <span
            style={{
              fontSize: "3rem",
              verticalAlign: "bottom",
              color: "#2563eb",
              fontWeight: "bold",
              marginLeft: 8,
              lineHeight: 1,
            }}
          >
            &rdquo;
          </span>
          <footer
            className="mt-4 text-right text-base text-blue-700 font-semibold"
            style={{
              color: "#60a5fa",
              fontWeight: 700,
              fontSize: "1.1rem",
              marginTop: "2rem",
              letterSpacing: "0.01em",
            }}
          >
            — Avril Hue, Founder & Lead Strategist
          </footer>
        </blockquote>
      </section>
      <section className="mt-8">
        <h2
          className="text-3xl font-bold mb-6"
          style={{
            color: "#2563eb",
            fontSize: "2.2rem",
            fontWeight: 900,
            letterSpacing: "0.01em",
            textShadow: "0 2px 16px #2563eb99",
          }}
        >
          About Us
        </h2>
        <p
          className="mb-6 text-xl text-gray-700"
          style={{
            color: "#e0e7ef",
            fontSize: "1.25rem",
            fontWeight: 500,
          }}
        >
          The modern music landscape can feel like a labyrinth of locked doors,
          each guarded by someone insisting they alone hold “the real” keys. It’s
          easy to feel every corridor is blocked by playlist curators, opaque
          label execs, or pitch-deck gatekeepers who seem to multiply faster
          than streaming platforms themselves.
        </p>
        <h3
          className="text-2xl font-semibold mt-8 mb-3"
          style={{ color: "#60a5fa", fontSize: "1.5rem", fontWeight: 700 }}
        >
          Why the information gap feels so vicious
        </h3>
        <ul
          className="list-disc pl-8 mb-6 text-lg text-gray-700"
          style={{
            color: "#e0e7ef",
            fontSize: "1.15rem",
            fontWeight: 500,
          }}
        >
          <li>
            Fragmented data – Each DSP shows you only its slice of the pie, so no
            single dashboard feels “true.”
          </li>
          <li>
            Asymmetric incentives – Aggregators and consultants profit on
            complexity, not clarity.
          </li>
          <li>
            Legacy mind-sets in new clothing – Old-school A&amp;R filters have
            simply re-emerged as curator emails and submission fees.
          </li>
        </ul>
        <h3
          className="text-2xl font-semibold mt-8 mb-3"
          style={{ color: "#60a5fa", fontSize: "1.5rem", fontWeight: 700 }}
        >
          Mindset shift
        </h3>
        <p
          className="mb-6 text-lg text-gray-700"
          style={{
            color: "#e0e7ef",
            fontSize: "1.15rem",
            fontWeight: 500,
          }}
        >
          Think of each gatekeeper as just one node in a sprawling mesh. Your job
          isn’t to bulldoze every wall; it’s to discover or build alternate
          routes—peer-to-peer collabs, direct-to-fan drops, or knowledge hubs
          like the Decoded Music articles you’ve already started. Every time you
          publish a clear royalty breakdown or share a cautionary tale, you
          loosen the industry’s grip on the next artist in line.
        </p>
        <div
          className="bg-blue-100 rounded-lg p-6 mb-6 text-blue-900 italic text-xl shadow"
          style={{
            borderLeft: "6px solid #2563eb",
            background: "#222b3a",
            color: "#60a5fa",
            fontSize: "1.25rem",
            fontStyle: "italic",
            borderRadius: 16,
            boxShadow: "0 2px 12px #2563eb33",
            padding: "2rem 2.5rem",
          }}
        >
          Takeaway: The maze is real, but the map is crowd-sourced. Keep
          documenting, keep sharing, keep querying numbers instead of
          narratives—and the “many” gatekeepers begin to look a lot smaller.
        </div>
      </section>
    </div>
  );
}
