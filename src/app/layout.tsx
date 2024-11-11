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

import { initClickstream, initGoogleAnalytics } from '@/utils/clickstream';
import { useEffect } from 'react';

import { Analytics } from '@vercel/analytics/react';

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
    initGoogleAnalytics();
  }, []);
  
  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link rel="icon" href="/icon?<generated>" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-icon?<generated>" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ClickstreamInit />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
