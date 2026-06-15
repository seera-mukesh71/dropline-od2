import './globals.css';

export const metadata = {
  title: 'Dropline OD — ICICI Bank',
  description: 'Pre-approved Dropline Overdraft facility',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}