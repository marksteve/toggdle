import { ActionFunction, redirect } from "remix";
import { getSession, commitSession } from "~/sessions";

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const body = await request.formData();
  const apiToken = body.get("apiToken");
  const credentials = btoa(`${apiToken}:api_token`);
  session.set("credentials", credentials);
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
