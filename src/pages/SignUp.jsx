import React from "react";
import SignupCTAExample from "../components/signup/SignupCTAExample";

export default function SignUp() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #111827 0%, #1e293b 100%)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 32,
          boxShadow: "0 8px 48px #0004",
          padding: "3.5rem 3rem 2.5rem 3rem",
          minWidth: 420,
          maxWidth: 520,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: "#222", // Make text dark for contrast
        }}
      >
        <SignupCTAExample />
      </div>
    </div>
  );
}
