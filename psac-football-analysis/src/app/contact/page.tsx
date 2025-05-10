'use client';
import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

// Define the type for form values
interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

// Define the type for form errors
interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  message?: string;
}

const ContactUs: React.FC = () => {
  const [formValues, setFormValues] = useState<FormValues>({ firstName: '', lastName: '', email: '', message: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true); // Default to light mode

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  // Validate form fields
  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};
    if (!formValues.firstName) errors.firstName = 'First Name is required';
    if (!formValues.lastName) errors.lastName = 'Last Name is required';
    if (!formValues.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formValues.message) errors.message = 'Message is required';
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      try {
        const response = await fetch("/api/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formValues),
        });

        if (response.ok) {
          console.log('Email sent successfully!');
          setSubmitted(true);
          setFormValues({ firstName: '', lastName: '', email: '', message: '' });
        } else {
          console.error('Failed to send email.');
        }
      } catch (error) {
        console.error('There was an error sending the email:', error);
      }
    } else {
      setFormErrors(errors);
    }
  };

  return (
    <React.StrictMode>
      <div className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} min-h-screen flex flex-col`}>
        <NavBar darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="flex flex-col items-center justify-center p-8 flex-grow">
          <h1 className="text-3xl font-semibold mb-8">{darkMode ? 'Contact Us' : 'Contact Us'}</h1>
          {submitted && <p className="mb-4 text-green-500">Thank you for your message! We will get back to you soon.</p>}
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                  First Name:
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formValues.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  required
                />
                {formErrors.firstName && <p className="mt-1 text-red-500">{formErrors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                  Last Name:
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formValues.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  required
                />
                {formErrors.lastName && <p className="mt-1 text-red-500">{formErrors.lastName}</p>}
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'
                }`}
                required
              />
              {formErrors.email && <p className="mt-1 text-red-500">{formErrors.email}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="message" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                Message:
              </label>
              <textarea
                id="message"
                name="message"
                value={formValues.message}
                onChange={handleChange}
                rows={5}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'
                }`}
                required
              />
              {formErrors.message && <p className="mt-1 text-red-500">{formErrors.message}</p>}
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md"
            >
              Submit
            </button>
          </form>
        </main>
        <Footer darkMode={darkMode} />
      </div>
    </React.StrictMode>
  );
};

export default ContactUs;
