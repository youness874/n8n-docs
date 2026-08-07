import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'KasbahAI YouTube Regeneration Studio',
  description: 'Turn a YouTube transcript into an original video and a native content pack.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <a href="/">
            <strong>KasbahAI</strong> · YouTube Regeneration Studio
          </a>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
