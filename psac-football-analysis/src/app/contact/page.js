// page.js
"use client";

import React, { useState } from 'react';
import Link from 'next/link'; // Import Link for navigation

/**
 * @typedef {object} FormErrors
 * @property {string} [name]
 * @property {string} [email]
 * @property {string} [message]
 */

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(true); // Add dark mode state
  /** @type {FormErrors} */
  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'message':
        setMessage(value);
        break;
      default:
        break;
    }
    // Clear the error for the current field when the user starts typing
    setFormErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
  };

  /**
   * @returns {FormErrors}
   */
  const validateForm = () => {
    /** @type {FormErrors} */
    const errors = {};
    if (!name) {
      errors.name = 'Name is required';
    }
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    if (!message) {
      errors.message = 'Message is required';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      console.log("Submitting contact information:", { name, email, message });
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
          setSubmitted(true);
          setName("");
          setEmail("");
          setMessage("");
        } else {
          console.error("Failed to submit contact information.");
          // Optionally show a server-side error message to the user
        }
      } catch (error) {
        console.error("Error submitting contact information:", error);
        // Optionally show a network error message to the user
      }
    }
  };

  return (
    <div className={`
      ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"} min-h-screen`}>
      {/* Header (copied from main page) */}
      <header className={`flex items-center justify-between p-4 border-b ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-500 rounded-full mr-4">
            {/* Replace with logo */}
          </div>
          <span className="text-lg font-semibold">PSAC Football Analysis</span>
        </div>
        <nav className="flex items-center space-x-4">
          <Link href="/contact" className="hover:text-gray-300">
            Contact Page
          </Link>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </nav>
      </header>
      <main className="flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-semibold mb-8">Contact Us</h1>
        {submitted && <p className="text-green-500 mb-4">Thank you for your message! We will get back to you soon.</p>}
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name:
            </label>
            <input type="text" id="name" name="name" value={name} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md ${formErrors.name ? 'border-red-500 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500' : 'border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'}`} required />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email:
            </label>
            <input type="email" id="email" name="email" value={email} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md ${formErrors.email ? 'border-red-500 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500' : 'border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'}`} required />
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
          </div>
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Message:
            </label>
            <textarea id="message" name="message" value={message} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md ${formErrors.message ? 'border-red-500 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500' : 'border-gray-700 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'}`} rows={5} required />
            {formErrors.message && <p className="text-red-500 text-xs mt-1">{formErrors.message}</p>}
          </div>
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Submit
          </button>
        </form>
      </main>
    </div>
  );
};

export default Contact;
