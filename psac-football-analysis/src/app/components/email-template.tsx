import * as React from 'react';

interface EmailTemplateProps {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
    firstName,
    message,
  }) => (
    <div>
      <p>Hello, {firstName}!</p>
      <p> Here is the message you sent: {message}</p>
    </div>
  );