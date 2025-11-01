// app/layout.js
import "./../styles/globals.css";

export const metadata = {
  title: "SmartifyAI",
  description: "We integrate AI into your business in one week.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
