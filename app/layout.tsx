import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "@/lib/supabase";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({
    subsets: ["latin", "cyrillic"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "College Portal",
    description: "Система управления образовательным процессом",
    viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <body className={`${inter.variable} font-sans antialiased text-slate-900 bg-slate-50 min-h-screen`}>
                <SupabaseProvider>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </SupabaseProvider>
            </body>
        </html>
    );
}
