import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Система управления оценками",
    description: "Минималистичный сервис для отслеживания успеваемости",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru">
            <body className={inter.className}>
                <main className="min-h-screen bg-background">
                    {children}
                </main>
            </body>
        </html>
    );
}