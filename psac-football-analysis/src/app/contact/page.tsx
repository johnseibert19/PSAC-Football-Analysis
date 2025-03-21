// contact.tsx
"use client";

import React, { useState } from "react";

const Contact: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // logic here to send the contact information to the server
    console.log("Submitting contact information:", { name, email, message });

    /*
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        console.log("Contact information submitted successfully.");
        // Optionally clear the form or show a success message
      } else {
        console.error("Failed to submit contact information.");
        // Show an error message to the user
      }
    } catch (error) {
      console.error("Error submitting contact information:", error);
      // Show an error message to the user
    }
    */
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-semibold mb-8">Contact Us</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Message:
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Contact;