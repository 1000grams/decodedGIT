import React from "react";
import SignInButton from "./SignInButton.jsx";

export default function SignIn() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #111827 0%, #1e293b 100%)",
        color: "#fff",
        fontFamily: "Georgia, serif",
      }}
    >
      <h1
        style={{
          fontSize: "3.5rem",
          fontWeight: 900,
          letterSpacing: "0.01em",
          textShadow: "0 4px 32px #2563eb55, 0 2px 0 #fff2",
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        SIGN IN
      </h1>
      <SignInButton />
      <div
        style={{
          fontSize: "1.7rem",
          color: "#60a5fa",
          fontWeight: 600,
          fontStyle: "italic",
          textAlign: "center",
          letterSpacing: "0.02em",
        }}
      >
        created By Artist, for Artist
      </div>
    </div>
  );
}
