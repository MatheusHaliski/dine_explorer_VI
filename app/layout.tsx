import type { Metadata } from "next";
import "./globals.css";
import { shareTechMono } from "./fonts";

export const metadata: Metadata = {
    title: "Dine Explorer AI",
    description: "BioDine™ — Wearable-enhanced dining intelligence powered by Cyber-Physical AI",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${shareTechMono.variable} fe-form-material min-h-screen antialiased`}>
        {children}
        </body>
        </html>
    );
}
