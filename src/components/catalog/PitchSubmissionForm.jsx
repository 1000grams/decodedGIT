import React, { useState } from "react";

const API_URL = process.env.REACT_APP_PITCH_API_URL || "/api/pitch";

export default function PitchSubmissionForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Submitting...");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("Pitch submitted! We will be in touch.");
      setForm({ name: "", email: "", organization: "", message: "" });
    } catch (err) {
      console.error("Pitch submit error", err);
      setStatus("There was an error sending your pitch.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        className="block mb-2 p-2 border rounded w-full"
      />
      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="block mb-2 p-2 border rounded w-full"
      />
      <input
        name="organization"
        placeholder="Organization"
        value={form.organization}
        onChange={handleChange}
        className="block mb-2 p-2 border rounded w-full"
      />
      <textarea
        name="message"
        placeholder="Message"
        value={form.message}
        onChange={handleChange}
        className="block mb-2 p-2 border rounded w-full"
      />
      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
        Submit
      </button>
      {status && <div className="mt-2">{status}</div>}
    </form>
  );
}
