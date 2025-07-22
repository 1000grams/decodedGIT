import React, { useState } from "react";

const API_URL =
  process.env.REACT_APP_CONTACT_API_URL ||
  (process.env.REACT_APP_API_BASE ? `${process.env.REACT_APP_API_BASE}/contact` : "/api/contact");
export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Sending...");
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        setStatus("Thank you! We'll be in touch soon.");
      } else {
        throw new Error("Request failed");
      }
    } catch (err) {
      window.localStorage.setItem(`contact_${Date.now()}`, JSON.stringify(form));
      setStatus("Saved locally (no backend)");
    }
  }
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
      <form
        onSubmit={handleSubmit}
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
        }}
      >
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "3rem",
            fontWeight: 900,
            color: "#1e293b",
            marginBottom: 32,
            letterSpacing: "0.01em",
            textAlign: "center",
          }}
        >
          Contact Us
        </h1>
        <input
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
          style={{
            fontSize: "1.5rem",
            padding: "1.1rem 1.2rem",
            borderRadius: 16,
            border: "1.5px solid #cbd5e1",
            marginBottom: 24,
            width: "100%",
            fontFamily: "inherit",
            background: "#f8fafc",
          }}
        />
        <input
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{
            fontSize: "1.5rem",
            padding: "1.1rem 1.2rem",
            borderRadius: 16,
            border: "1.5px solid #cbd5e1",
            marginBottom: 24,
            width: "100%",
            fontFamily: "inherit",
            background: "#f8fafc",
          }}
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          required
          rows={5}
          style={{
            fontSize: "1.5rem",
            padding: "1.1rem 1.2rem",
            borderRadius: 16,
            border: "1.5px solid #cbd5e1",
            marginBottom: 32,
            width: "100%",
            fontFamily: "inherit",
            background: "#f8fafc",
            resize: "vertical",
          }}
        />
        <button
          type="submit"
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            padding: "1.2rem 3.5rem",
            borderRadius: 16,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            boxShadow: "0 2px 16px #2563eb55",
            cursor: "pointer",
            marginBottom: 16,
            letterSpacing: "0.01em",
          }}
        >
          Send
        </button>
        {status && (
          <div
            style={{
              marginTop: 18,
              fontSize: "1.3rem",
              color: status.startsWith("Thank") ? "#22c55e" : "#ef4444",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {status}
          </div>
        )}
      </form>
    </div>
  );
}
