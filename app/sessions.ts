import { createCookieSessionStorage } from "remix";

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      secrets: globalThis.COOKIE_SECRET ?? "secret",
    },
  });

export { getSession, commitSession, destroySession };
