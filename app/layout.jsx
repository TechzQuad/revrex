import './globals.css';

export const metadata = {
  title: 'Sign Up',
  description: 'Sign up form',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
