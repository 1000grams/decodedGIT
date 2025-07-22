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
