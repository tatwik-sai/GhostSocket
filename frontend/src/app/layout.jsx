import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GhostSocket",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <Toaster  position="top-right"
          toastOptions={{
              style: {
                background: '#1F1F23',
                border: '1px solid #ffffff1a',
                borderRadius: '8px',
                padding: '16px',
                color: '#ffffff',
              },
          }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
