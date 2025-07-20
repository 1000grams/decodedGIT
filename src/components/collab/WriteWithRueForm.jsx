import React, { useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "/api";

export default function WriteWithRueForm() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    productionType: "",
    projectTitle: "",
    roleCompany: "",
    synopsis: "",
    rationale: "",
    usage: "",
    deadline: "",
    contact: "",
  });
  const [status, setStatus] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Submitting...");
    // Replace with your actual API endpoint
    const response = await fetch(`${API_BASE}/write-with-rue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (response.ok) {
      setStatus("Thank you! We'll review your submission and get back within 24 hours.");
    } else {
      setStatus("There was an error submitting your info.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 border rounded bg-white shadow">
      <h2 className="text-2xl font-bold mb-4">Write with Rue de Vivre.</h2>
      <p className="mb-4">
        Producers, topliners, and lyricists—pitch ideas, co-write, and get credited on future releases.<br />
        <span className="font-semibold">Sign Up to Collaborate</span> → Please fill out the form and include your project details. We'll review and get back within 24 hours.
      </p>
      
      <div className="mb-3">
        <label className="block font-semibold mb-1">Production Type</label>
        <div className="flex gap-4">
          {["Film", "TV Series", "Video Game", "Ad"].map(type => (
            <label key={type}>
              <input
                type="radio"
                name="productionType"
                value={type}
                checked={form.productionType === type}
                onChange={handleChange}
                className="mr-1"
              />
              {type}
            </label>
          ))}
        </div>
      </div>
      
      <input
        name="projectTitle"
        placeholder="Project / Episode Title"
        value={form.projectTitle}
        onChange={handleChange}
        className="block mb-3 p-2 border rounded w-full"
        required
      />
      
      <input
        name="roleCompany"
        placeholder="Your Role & Company (e.g. Music Supervisor at XYZ Studios)"
        value={form.roleCompany}
        onChange={handleChange}
        className="block mb-3 p-2 border rounded w-full"
        required
      />
      
      <textarea
        name="synopsis"
        placeholder="Project Synopsis (brief description of story / tone)"
        value={form.synopsis}
        onChange={handleChange}
        className="block mb-3 p-2 border rounded w-full"
        required
      />
      
      <textarea
        name="rationale"
        placeholder="Why This Track? (your 1–2 line rationale)"
        value={form.rationale}
        onChange={handleChange}
        className="block mb-3 p-2 border rounded w-full"
        required
      />
      
      <input
        name="usage"
        placeholder="Usage Details (Scene start/end, duration, exclusivity?)"
        value={form.usage}
        onChange={handleChange}
        className="block mb-3 p-2 border rounded w-full"
        required
      />
      
      <input
        name="deadline"
        placeholder="Deadline / Window (e.g. Need asset by July 15, 2025)"
        value={form.deadline}
        onChange={handleChange}
        className="block mb-3 p-2 border rounded w-full"
        required
      />
      
      <input
        name="contact"
        placeholder="Contact Name & Email (e.g. Jane Doe – jane@studio.com)"
        value={form.contact}
        onChange={handleChange}
        className="block mb-3 p-2 border rounded w-full"
        required
      />
      
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
      {status && <div className="mt-3">{status}</div>}
    </form>
  );
}
