import type { Metadata } from "next";
import {  Nunito, Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { SmartProvider } from "./context/SmartContext";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "RxConcile",
  description: "RxConcile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} ${geist.variable} font-sans antialiased`}
      >
        <SmartProvider>
          <Navbar />
          {children}
        </SmartProvider>
      </body>
    </html>
  );
}
