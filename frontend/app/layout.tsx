import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./global.css";

import { Poppins, Sora, Playfair_Display } from "next/font/google";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import StarCursor from "@/components/StarCursor";

/* BODY FONT */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

/* UI FONT */
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
});

/* HEADING FONT */
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-heading",
});

export const metadata = {
  title: "Dietara Hub",
  description: "Smart Diet Platform",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${sora.variable} ${playfair.variable}`}
      >
        <AuthProvider>

          {/*  PREMIUM CURSOR */}
          <StarCursor />

          {/*  NAVBAR */}
          <Navbar />

          {/*  PAGE CONTENT */}
          {children}

          {/* FOOTER */}
          <Footer />

          {/*  TOASTIFY (FINAL FIXED VERSION) */}
          <ToastContainer
            position="top-center"   //  better than right
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            theme="dark"            //  IMPORTANT (matches your UI)
          />

        </AuthProvider>
      </body>
    </html>
  );
}