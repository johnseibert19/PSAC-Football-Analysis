// contact.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

const ContactPage = () => {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Update theme when isDarkMode changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <main className={`flex min-h-screen flex-col items-center justify-start ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <div className="max-w-4xl w-full py-16 px-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Contact Us</h1>
        
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-md'} rounded-lg p-8`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Have questions about our football analysis tool? We&apos;d love to hear from you.
                Fill out the form and we&apos;ll get back to you as soon as possible.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>support@psacfootball.com</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Pennsylvania State Athletic Conference</p>
                </div>
              </div>
            </div>

            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  className={`w-full px-4 py-2 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border focus:border-blue-500 focus:outline-none`}
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  className={`w-full px-4 py-2 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border focus:border-blue-500 focus:outline-none`}
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  id="message"
                  rows={4}
                  className={`w-full px-4 py-2 rounded ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border focus:border-blue-500 focus:outline-none`}
                  placeholder="Your message"
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-700 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;