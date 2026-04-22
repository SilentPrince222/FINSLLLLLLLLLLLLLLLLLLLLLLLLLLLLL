import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { AuthProvider } from '@/lib/auth';
import { SupabaseProvider } from '@/lib/supabase';
import { Toaster } from 'sonner';

const inter = Inter({
    subsets: ["latin", "cyrillic"],
    variable: "--font-inter",
    display: "swap",
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-display",
    display: "swap",
    weight: ["500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
    weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
    title: "College Portal",
    description: "Система управления образовательным процессом",
};

export const viewport = {
    width: "device-width",
    initialScale: 1
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen`}>
                <NextIntlClientProvider messages={messages}>
                    <AuthProvider>
                        <SupabaseProvider>
                            <ThemeProvider
                                attribute="class"
                                defaultTheme="system"
                                enableSystem
                                disableTransitionOnChange
                            >
                                {children}
                                <Toaster position="top-right" richColors />
                            </ThemeProvider>
                        </SupabaseProvider>
                    </AuthProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
