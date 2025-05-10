"use client";

import React, { useState, useEffect } from "react";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

interface GlossaryTerm {
  term: string;
  definition: string;
}

const Glossary: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  const glossaryTerms: GlossaryTerm[] = [
    { term: "Down", definition: "One of four attempts a team has to advance the ball at least 10 yards. If a team fails to gain 10 yards in four downs, possession of the ball is given to the opposing team." },
    { term: "End Zone", definition: "The designated area at each end of the field where a touchdown is scored." },
    { term: "Field Goal", definition: "Scoring by kicking the football through the goalposts (crossbar and uprights), worth three points." },
    { term: "First Down Conversion", definition: "Successful 10-yard advancement of the football within four downs." },
    { term: "Football", definition: "The oval-shaped ball used in the game." },
    { term: "Interception", definition: "When a defensive player catches a pass intended for an offensive player." },
    { term: "Line of Scrimmage", definition: "The imaginary line that spans the width of the field where the ball is placed before each play begins." },
    { term: "Pass", definition: "A play where the quarterback throws the ball to a teammate." },
    { term: "Play", definition: "An individual attempt to advance the ball, starting with the snap and ending when the player with the ball is tackled, goes out of bounds, or a pass is incomplete." },
    { term: "Points", definition: "Follows English usage, the objective is to obtain more points than the other team." },
    { term: "Quarterback", definition: "The offensive player who typically throws the football." },
    { term: "Routes", definition: "The pre-planned paths that receivers run during a pass play." },
    { term: "Rush", definition: "A play where a player carries the football." },
    { term: "Snap", definition: "The act of the center handing or passing the ball to the quarterback to begin a play." },
    { term: "Tackle", definition: "When a defensive player brings the ball carrier to the ground, ending the play." },
    { term: "Touchdown", definition: "Scoring by advancing the ball into the opponent's end zone, worth six points." },
    { term: "2-Point Conversion", definition: "After a touchdown, a team can attempt to score two extra points by running or passing the ball into the end zone from the two-yard line." },
    { term: "Yard", definition: "Follows English usage, three feet." },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const toggleDefinition = (term: string) => {
    setExpandedTerm(expandedTerm === term ? null : term);
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"} min-h-screen flex flex-col`}>
      <NavBar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="p-8 flex-grow relative">
        <section id="husky-film-room" className="mb-8">
          <div className="container">
            <h2 className="text-2xl font-semibold mb-4">What is Husky Film Room?</h2>
            <p className="mb-4">
              Imagine you have a bunch of football game videos. This project is about creating a website that:
            </p>
            <ul>
              <li className="list-disc ml-6 mb-2">Watches the videos for you.</li>
              <li className="list-disc ml-6 mb-2">Figures out what happened in each play.</li>
              <li className="list-disc ml-6 mb-2">Keeps track of how different players performed.</li>
            </ul>
            <p>
              You upload your game videos to the website. It uses advanced technology to analyze the players and
              the ball, determining what happened in each play, who ran where, who caught the ball, etc. It then
              organizes this information so coaches and players can easily see it. For example, you can view all
              the times a player made a great tackle or how often a particular play worked well.
            </p>
          </div>
        </section>

        <h2 className="text-3xl font-semibold mb-8">Glossary</h2>
        <ul>
          {glossaryTerms.map((termItem, index) => (
            <li key={index} className="mb-4">
              <strong
                className="block cursor-pointer"
                onClick={() => toggleDefinition(termItem.term)}
              >
                {termItem.term}
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">(Click to expand)</span>
              </strong>
              {expandedTerm === termItem.term && (
                <span className="block mt-2">{termItem.definition}</span>
              )}
            </li>
          ))}
        </ul>
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 bg-blue-500 text-white rounded-full p-3 shadow-md cursor-pointer ${darkMode ? "hover:bg-blue-400" : "hover:bg-blue-600"} transition-colors duration-200`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span className="sr-only">Back to Top</span>
          </button>
        )}
      </main>
      <Footer darkMode={darkMode}/>
    </div>
  );
};

export default Glossary;
