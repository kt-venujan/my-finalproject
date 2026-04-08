"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer } from "react-toastify";
import StarCursor from "@/components/StarCursor";
import GlobalAuth from "@/components/GlobalAuth";
import NavigationLoader from "@/components/NavigationLoader";
import ScrollReveal from "@/components/ScrollReveal";
import FloatingAIAssistant from "@/components/FloatingAIAssistant";
import PageTransition from "@/components/PageTransition";

type AppChromeProps = {
  children: ReactNode;
};

const shouldHideMainChrome = (pathname: string) => pathname.startsWith("/community");

export default function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const hideMainChrome = shouldHideMainChrome(pathname || "");

  return (
    <AuthProvider>
      <StarCursor />
      <GlobalAuth />

      {!hideMainChrome && <Navbar />}

      <NavigationLoader />

      {!hideMainChrome && <FloatingAIAssistant />}

      <PageTransition>{children}</PageTransition>

      <ScrollReveal />

      {!hideMainChrome && <Footer />}

      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </AuthProvider>
  );
}
