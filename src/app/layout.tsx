'use client';

import localFont from "next/font/local";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import "./globals.css";

import type {} from '@mui/x-data-grid/themeAugmentation';
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightGreen, pink } from '@mui/material/colors';

import { initClickstream } from '@/utils/clickstream';
import { useEffect } from 'react';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';

const theme = createTheme({
  palette: {
    primary: {
      main: lightGreen[400],
    },
    secondary: {
      main: pink[300],
    },
  },
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: 'red',
        },
      },
    },
  },
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

function ClickstreamInit() {
  useEffect(() => {
    initClickstream();
  }, []);
  
  return null;
}

function GoogleAnalyticsInit() {
  return (
    <>
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
          `
        }}
      />
      <Script
        id="ga-tag"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && <GoogleAnalyticsInit />}
        <title>英语听写练习</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" href="/icon?<generated>" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-icon?<generated>" />
        
        <meta itemProp="name" content="英语听写练习" />
        <meta itemProp="description" content="一个帮助孩子提高英语听力和拼写能力的有趣工具。通过打字练习来增强英语学习效果！" />
        <meta itemProp="image" content="/about-all.jpeg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ClickstreamInit />
          {children}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
