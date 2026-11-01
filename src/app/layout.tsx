import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});
export const metadata: Metadata = {
  title: "Gatherly — Make room for the moments",
  description:
    "Your thoughtful event planning companion. Bring weddings, birthdays and community celebrations together with practical budgets, timelines, vendor checklists and personalized ideas.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={dmSans.variable}>{children}</body>
    </html>
  );
}
