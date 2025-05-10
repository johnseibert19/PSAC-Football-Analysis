"use client";
import React from 'react';
import styles from './Footer.module.css'; // Changed from require() to import

const Footer = ({ darkMode }) => {
  return (
    <footer className={`${styles.footer} ${darkMode ? '' : styles.light}`}>
      <div className={styles.container}>
        <p className={styles.text}>
          &copy; {new Date().getFullYear()} PSAC Football. All rights reserved.
        </p>
        <p className={styles.text}>
          Authors: Matt Boehme, Zach Eisele, Justin Peasley, John Seibert
        </p>
        <div className={styles.socialLinks}>
          <a href="https://www.facebook.com/PSACSports" className={styles.link} target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://twitter.com/PSACsports" className={styles.link} target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://www.instagram.com/psacsports/" className={styles.link} target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
