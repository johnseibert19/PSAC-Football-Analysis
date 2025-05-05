"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const next_link_1 = __importDefault(require("next/link"));
const Header_module_css_1 = __importDefault(require("./NavBar.module.css")); // Import the CSS Module

const NavBar = ({ darkMode, setDarkMode }) => {
    return (
        <header className={`${Header_module_css_1.default.header} ${darkMode ? Header_module_css_1.default.darkMode : Header_module_css_1.default.lightMode}`}>
            <div className={Header_module_css_1.default.logoContainer}>
                <next_link_1.default href="/" className={Header_module_css_1.default.logoLink}>
                    {/* Logo is still the background of the header */}
                    <span className={Header_module_css_1.default.logoText}>PSAC Football Analysis</span>
                </next_link_1.default>
            </div>
            <nav className={Header_module_css_1.default.nav}>
                <next_link_1.default href="/contact" className={`${Header_module_css_1.default.navLink} mr-4`}>
                    Contact Page
                </next_link_1.default>
                <next_link_1.default href="/glossary" className={`${Header_module_css_1.default.navLink} mr-4`}>
                    Glossary
                </next_link_1.default>
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={Header_module_css_1.default.darkModeToggle} // Removed ml-4
                >
                    {darkMode ? "Light Mode" : "Dark Mode"}
                </button>
            </nav>
        </header>
    );
};
exports.default = NavBar;