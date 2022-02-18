import type { MetaFunction } from "remix";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "remix";
import styles from "~/styles/app.css";

export const meta: MetaFunction = () => {
  return {
    title: "Toggdle",
    description:
      "Toggdle fetches your Toggl weekly report and prints it out Wordle-style.",
  };
};

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex flex-col items-center gap-y-5 p-5">
          <h1 className="text-4xl font-bold">Toggdle</h1>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
