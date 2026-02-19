import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chat",
  description: "AI chat with WorkflowChatTransport and Vercel Gateway",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
