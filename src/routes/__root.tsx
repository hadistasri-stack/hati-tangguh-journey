import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Reset Hati — Program BK Islam untuk Anak Pecandu Game" },
      { name: "description", content: "Program 'Reset Hati' berbasis BK Islam. Media hibrid game-logbook untuk meningkatkan motivasi belajar, ibadah sholat, dan interaksi sosial anak pecandu game online." },
      { name: "author", content: "Reset Hati" },
      { name: "theme-color", content: "#f4c79a" },
      { property: "og:title", content: "Reset Hati — Program BK Islam untuk Anak Pecandu Game" },
      { property: "og:description", content: "Program 'Reset Hati' berbasis BK Islam. Media hibrid game-logbook untuk meningkatkan motivasi belajar, ibadah sholat, dan interaksi sosial anak pecandu game online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Reset Hati — Program BK Islam untuk Anak Pecandu Game" },
      { name: "twitter:description", content: "Program 'Reset Hati' berbasis BK Islam. Media hibrid game-logbook untuk meningkatkan motivasi belajar, ibadah sholat, dan interaksi sosial anak pecandu game online." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6450b7f4-c3ff-46bc-95d0-7ab5a88310f4/id-preview-259b321c--10bcb1c5-b20f-471b-8500-f75516645414.lovable.app-1780379375569.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6450b7f4-c3ff-46bc-95d0-7ab5a88310f4/id-preview-259b321c--10bcb1c5-b20f-471b-8500-f75516645414.lovable.app-1780379375569.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const [qc] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={qc}>
      <Outlet />
    </QueryClientProvider>
  );
}
