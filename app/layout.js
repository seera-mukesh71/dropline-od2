import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Dropline OD — ICICI Bank',
  description: 'Pre-approved Dropline Overdraft facility',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://dropline-chatbot-widget.vercel.app/embed.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}