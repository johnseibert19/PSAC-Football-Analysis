// contact.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

const ContactPage = () => {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-gray-900 text-white">
      {/* Top Navigation Bar */}
      <div className="bg-gray-800 w-full py-4 px-8 flex justify-between items-center">
        <span 
          className="font-bold text-xl cursor-pointer" 
          onClick={() => router.push('/')}
        >
          PSAC Football Analysis
        </span>
        <div>
          <button className="text-sm text-gray-300 hover:text-white mr-4">Contact</button>
          <button className="text-sm text-gray-300 hover:text-white">Light Mode</button>
        </div>
      </div>

      <div className="max-w-4xl w-full py-16 px-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Contact Us</h1>
        
        <div className="bg-gray-800 rounded-lg shadow-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
              <p className="text-gray-300 mb-6">
                Have questions about our football analysis tool? We'd love to hear from you.
                Fill out the form and we'll get back to you as soon as possible.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-gray-300">support@psacfootball.com</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p className="text-gray-300">Pennsylvania State Athletic Conference</p>
                </div>
              </div>
            </div>

            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none"
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