import Link from 'next/link';
import styles from './NavBar.module.css'; 

interface NavBarProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

const NavBar: React.FC<NavBarProps> = ({ darkMode, setDarkMode }) => {
  return (
    <header className={`${styles.header} ${darkMode ? styles.darkMode : styles.lightMode}`}>
      <div className={styles.logoContainer}>
        <Link href="/" className={styles.logoLink}>
          {/* Logo is still the background of the header */}
          <span className={styles.logoText}>PSAC Football Analysis</span>
        </Link>
      </div>
      <nav className={styles.nav}>
        <Link href="/contact" className={`${styles.navLink} mr-4`}>
          Contact Page
        </Link>
        <Link href="/glossary" className={`${styles.navLink} mr-4`}>
          Glossary
        </Link>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={styles.darkModeToggle} // Removed ml-4
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </nav>
    </header>
  );
};

export default NavBar;