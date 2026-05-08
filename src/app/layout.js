

import { Figtree } from "next/font/google";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";


const figtree = Figtree({ subsets: ["latin"] , variable: "--font-figtree",});

const instrument_serif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument-serif",   });

export const metadata = {
  title: "AI Cognitive Distortion Analyzer",
  description: "Identify negative thinking patterns",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} ${instrument_serif.variable} dark:bg-gray-900`}>
        {children}
      </body>
    </html>
  );
}
