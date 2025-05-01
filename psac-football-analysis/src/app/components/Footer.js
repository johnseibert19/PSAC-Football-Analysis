"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const Footer_module_css_1 = __importDefault(require("./Footer.module.css"));
const Footer = ({ darkMode }) => {
    return (
        <footer className={`${Footer_module_css_1.default.footer} ${darkMode ? '' : Footer_module_css_1.default.light}`}>
            <div className={Footer_module_css_1.default.container}>
                <p className={Footer_module_css_1.default.text}>
                    &copy; {new Date().getFullYear()} PSAC Football. All rights reserved.
                </p>
                <p className={Footer_module_css_1.default.text}>
                    Authors: Matt Boehme, Zach Eisele, Justin Peasley, John Seibert
                </p>
                <div className={Footer_module_css_1.default.socialLinks}>
                <a href="https://www.facebook.com/PSACSports" className={Footer_module_css_1.default.link} target="_blank" rel="noopener noreferrer">Facebook</a>
                <a href="https://twitter.com/PSACsports" className={Footer_module_css_1.default.link} target="_blank" rel="noopener noreferrer">Twitter</a>
                <a href="https://www.instagram.com/psacsports/" className={Footer_module_css_1.default.link} target="_blank" rel="noopener noreferrer">Instagram</a>
                </div>
            </div>
        </footer>
    );
};
exports.default = Footer;
