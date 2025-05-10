"use client";

import React, { useState } from "react";
import Link from 'next/link'; // Import Link for navigation

const Glossary = () => {
  const [darkMode, setDarkMode] = useState(true);

  const glossaryTerms = [
    { term: "Down", definition: "One of four attempts a team has to advance the ball at least 10 yards. If a team fails to gain 10 yards in four downs, possession of the ball is given to the opposing team." },
    // ... (rest of the glossary terms)
    { term: "Yard", definition: "Follows English usage, three feet." },
  ];

  return (
    <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"} min-h-screen`}>
      <header className={`flex items-center justify-between p-4 border-b ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 rounded-full mr-4">
              {/* Replace with logo */}
            </div>
            <span className="text-lg font-semibold">PSAC Football Analysis</span>
          </Link>
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
      <main className="p-8">
        <h1 className="text-3xl font-semibold mb-8">Glossary</h1>
        <ul>
          {glossaryTerms.map((term, index) => (
            <li key={index} className="mb-4">
              <strong className="block">{term.term}:</strong>
              <span>{term.definition}</span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default Glossary;
