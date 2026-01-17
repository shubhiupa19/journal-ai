import { Inter } from "next/font/google";
import { Playfair_Display } from "next/font/google";     
  import { Nunito } from "next/font/google";     
import "./globals.css";

const inter = Inter({ subsets: ["latin"]});

const font = Playfair_Display({ subsets: ["latin"] }); 

const nunito = Nunito({subsets: ["latin"]})

export const metadata = {
  title: "AI Cognitive Distortion Analyzer",
  description: "Identify negative thinking patterns",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={nunito.className}>
        {children}
      </body>
    </html>
  );
}
