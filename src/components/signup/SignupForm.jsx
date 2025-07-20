import React, { useState } from "react";

export default function SignupForm({ type }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    message: "",
    type: type || "",
  });
  const [status, setStatus] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Submitting...");
    const apiUrl =
      process.env.REACT_APP_SIGNUP_API_URL ||
      "https://n64vgs0he0.execute-api.eu-central-1.amazonaws.com/prod/signup";
    try {
      const response = await fetch(apiUrl, {
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
      window.localStorage.setItem(`signup_${Date.now()}`, JSON.stringify(form));
      setStatus("Saved locally (no network)");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 border rounded bg-white shadow">
      <h2 className="text-xl font-bold mb-4">
        {type === "artist" ? "Join as an Artist/Label" : "Find Music to License"}
      </h2>
      <input
        name="name"
        placeholder="Your Name"
        value={form.name}
        onChange={handleChange}
        className="block mb-3 p-2 border rounded w-full"
        required
      />
      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="block mb-3 p-2 border rounded w-full"
        required
      />
      <input
        name="company"
        placeholder="Company/Brand (optional)"
        value={form.company}
        onChange={handleChange}
        className="block mb-3 p-2 border rounded w-full"
      />
      <input
        name="role"
        placeholder="Your Role (e.g. A&R, Label Owner, Music Supervisor)"
        value={form.role}
        onChange={handleChange}
        className="block mb-3 p-2 border rounded w-full"
      />
      <textarea
        name="message"
        placeholder={type === "artist"
          ? "Tell us about your music, label, or project"
          : "What kind of music are you looking for? (genre, mood, usage, etc.)"}
        value={form.message}
        onChange={handleChange}
        className="block mb-3 p-2 border rounded w-full"
        required
      />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
      {status && <div className="mt-3">{status}</div>}
    </form>
  );
}
