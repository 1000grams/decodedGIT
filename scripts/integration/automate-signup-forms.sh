#!/bin/bash
# automate-signup-forms.sh

mkdir -p src/components/signup

# Common Signup Form Component
cat > src/components/signup/SignupForm.jsx <<'EOF'
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
    // Replace with your actual API endpoint
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (response.ok) {
      setStatus("Thank you! We'll be in touch soon.");
    } else {
      setStatus("There was an error submitting your info.");
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
EOF

echo "✅ SignupForm.jsx created in src/components/signup/"

# Example usage snippet for your CTA section
cat > src/components/signup/SignupCTAExample.jsx <<'EOF'
import React, { useState } from "react";
import SignupForm from "./SignupForm";

export default function SignupCTAExample() {
  const [showForm, setShowForm] = useState("");
  return (
    <div className="text-center my-8">
      <h2 className="text-2xl font-bold mb-4">Ready to decode music?</h2>
      <div className="flex justify-center gap-4 mb-4">
        <button
          className="px-6 py-2 bg-green-600 text-white rounded"
          onClick={() => setShowForm("license")}
        >
          Find Music to License
        </button>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded"
          onClick={() => setShowForm("artist")}
        >
          Join as an Artist/Label
        </button>
      </div>
      {showForm === "license" && <SignupForm type="license" />}
      {showForm === "artist" && <SignupForm type="artist" />}
    </div>
  );
}
EOF

echo "✅ SignupCTAExample.jsx created in src/components/signup/"

