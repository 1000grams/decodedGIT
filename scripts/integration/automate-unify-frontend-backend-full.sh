#!/bin/bash
# automate-unify-frontend-backend-full.sh

# 1. Create About page
mkdir -p src/pages
cat > src/pages/About.jsx <<'EOF'
import React from "react";
export default function About() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">About Us</h1>
      <p>
        The modern music landscape can feel like a labyrinth of locked doors, each guarded by someone insisting they alone hold “the real” keys. It’s easy to feel every corridor is blocked by playlist curators, opaque label execs, or pitch-deck gatekeepers who seem to multiply faster than streaming platforms themselves.
      </p>
      <p className="mt-4">
        But the very frustration you’re voicing is also the spark behind movements like Decoded Music, a no-fluff series that strips the industry down to royalties, rights, and real strategy—reminding artists that authenticity can still beat the algorithmic odds.
      </p>
    </div>
  );
}
EOF

# 2. Create Contact page with form
cat > src/pages/Contact.jsx <<'EOF'
import React, { useState } from "react";
export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Sending...");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (response.ok) {
      setStatus("Thank you! We'll be in touch soon.");
    } else {
      setStatus("There was an error sending your message.");
    }
  }
  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-8 border rounded bg-white shadow">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
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
        placeholder="Your Email"
        value={form.email}
        onChange={handleChange}
        className="block mb-3 p-2 border rounded w-full"
        required
      />
      <textarea
        name="message"
        placeholder="Your Message"
        value={form.message}
        onChange={handleChange}
        className="block mb-3 p-2 border rounded w-full"
        required
      />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
      {status && <div className="mt-3">{status}</div>}
    </form>
  );
}
EOF

# 3. Update Header navigation (src/components/Header.js)
HEADER="src/components/Header.js"
if [ -f "$HEADER" ]; then
  # Ensure React Router Link is imported
  if ! grep -q "Link from" "$HEADER"; then
    sed -i '1iimport { Link } from "react-router-dom";' "$HEADER"
  fi
  # Replace nav links with unified routes (replace nav block)
  sed -i '/<nav/,/<\/nav>/c\
      <nav className="flex gap-6">\
        <Link to="/dashboard">Artist Dashboard</Link>\
        <Link to="/about">About</Link>\
        <Link to="/contact">Contact</Link>\
      </nav>' "$HEADER"
  echo "✅ Updated header navigation in $HEADER"
else
  echo "⚠️  $HEADER not found. Please update your header navigation manually."
fi

# 4. Update Footer About link (src/components/Footer.js)
FOOTER="src/components/Footer.js"
if [ -f "$FOOTER" ]; then
  # Replace About Us text/link with a route to /about
  sed -i 's|About Us|<a href="/about" className="underline">About Us</a>|g' "$FOOTER"
  echo "✅ Updated About link in $FOOTER"
else
  echo "⚠️  $FOOTER not found. Please update your footer manually."
fi

# 5. Ensure React Router routes in src/App.js
APPJS="src/App.js"
if [ -f "$APPJS" ]; then
  # Add imports if missing
  if ! grep -q 'import About from "./pages/About";' "$APPJS"; then
    sed -i '1iimport About from "./pages/About";' "$APPJS"
  fi
  if ! grep -q 'import Contact from "./pages/Contact";' "$APPJS"; then
    sed -i '1iimport Contact from "./pages/Contact";' "$APPJS"
  fi
  # Add routes if missing
  if ! grep -q 'path="/about"' "$APPJS"; then
    sed -i '/<Routes>/a\
        <Route path="/about" element={<About />} />' "$APPJS"
  fi
  if ! grep -q 'path="/contact"' "$APPJS"; then
    sed -i '/<Routes>/a\
        <Route path="/contact" element={<Contact />} />' "$APPJS"
  fi
  echo "✅ Ensured /about and /contact routes in $APPJS"
else
  echo "⚠️  $APPJS not found. Please add About and Contact routes manually."
fi

# 6. Scaffold backend handler for contact form (SES-based)
mkdir -p backend/function/contactFormHandler/src
cat > backend/function/contactFormHandler/src/contact_form_handler.py <<'EOF'
import boto3
import os

SES = boto3.client("ses")
TO_EMAIL = "ops@decodedmusic.com"
FROM_EMAIL = os.environ.get("FROM_EMAIL", "ops@decodedmusic.com")

def lambda_handler(event, context):
    import json
    body = event.get("body")
    if isinstance(body, str):
        body = json.loads(body)
    subject = f"Contact Form Submission from {body.get('name', '')}"
    body_text = f"Name: {body.get('name', '')}\nEmail: {body.get('email', '')}\nMessage:\n{body.get('message', '')}"
    SES.send_email(
        Source=FROM_EMAIL,
        Destination={"ToAddresses": [TO_EMAIL]},
        Message={
            "Subject": {"Data": subject},
            "Body": {"Text": {"Data": body_text}}
        }
    )
    return {"statusCode": 200, "body": "Message sent."}
EOF

echo "✅ Backend Lambda handler for contact form created at backend/function/contactFormHandler/src/contact_form_handler.py"

echo "🚀 Next steps:"
echo "1. Connect your frontend contact form to the backend handler in backend/function/contactFormHandler/src/contact_form_handler.py."
echo "2. Deploy your backend as needed (no Amplify required)."
echo "3. Test /about and /contact from both header and footer."
