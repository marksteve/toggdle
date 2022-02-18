import { flatGroup } from "d3-array";
import { scaleQuantize } from "d3-scale";
import { addDays, getHours } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { Fragment } from "react";
import { Link } from "react-router-dom";
import type { LoaderFunction } from "remix";
import { Form, useLoaderData } from "remix";
import { getSession } from "~/sessions";

const REST_RATIO = 1 - 17 / 52; // https://en.wikipedia.org/wiki/52/17_rule

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const credentials = session.get("credentials");

  const url = new URL(request.url);
  const workspace = url.searchParams.get("workspace");
  const since = url.searchParams.get("since");
  const until = addDays(new Date(since!), 6).toISOString();

  let me: any = {};
  let workspaces: any[] = [];
  let report: any[] = [];
  let squares: any[][] = [];

  if (credentials) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    };
    me = (
      (await (
        await fetch("https://api.track.toggl.com/api/v8/me", { headers })
      ).json()) as any
    ).data;
    workspaces = await (
      await fetch("https://api.track.toggl.com/api/v8/workspaces", { headers })
    ).json();
    if (workspace && since?.length) {
      report = await getReport(
        { workspace_id: workspace, since, until },
        credentials
      );
      const daily = flatGroup(report, (d) => d.start.substr(0, 10));
      const hourRange = [0, 1, 2, 3, 4, 5];
      const hourScale = scaleQuantize([0, 23], hourRange);
      const maxHours = 24 / hourRange.length;
      const durScale = (x: number) =>
        x < maxHours * REST_RATIO ? (x > 0 ? "🟩" : "⬜") : "🟨";
      squares = daily.map(([date, entries]) => {
        const quantized: any = flatGroup(
          entries.map((d) => [
            hourScale(getHours(utcToZonedTime(new Date(d.start), me.timezone))),
            d.dur,
          ]),
          (d) => d[0]
        )
          .map(([hour, d]) => [
            hour,
            d.reduce((a, b) => a + b[1], 0) / 1000 / 60 / 60, // hours
          ])
          .reduce(
            (a, b) => ({
              ...a,
              [b[0]]: b[1],
            }),
            {}
          );
        return [date, hourRange.map((hour) => durScale(quantized[hour] || 0))];
      });
    }
  }

  return {
    hasToken: !!credentials,
    params: { workspace, since },
    me,
    workspaces,
    squares,
  };
};

async function getReport(params: any, credentials: string) {
  const url = "https://api.track.toggl.com/reports/api/v2/details";
  let report: any[] = [];
  let page = 1;
  while (true) {
    const resp: any = await (
      await fetch(
        `${url}?${new URLSearchParams({
          ...params,
          user_agent: "Toggdle",
          order_desc: "off",
          page,
        })}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`,
          },
        }
      )
    ).json();
    report = [...report, ...resp.data];
    if (report.length >= resp.total_count) {
      return report;
    }
    page++;
  }
}

export default function Index() {
  const data = useLoaderData();

  if (!data.hasToken) {
    return (
      <Form
        method="post"
        action="set-token"
        className="flex max-w-sm flex-col gap-y-5"
      >
        <div className="flex flex-col items-center gap-y-5">
          <p>
            Toggdle fetches your Toggl weekly report and print it out
            Wordle-style.
          </p>
          <div className="grid grid-cols-2 items-center gap-x-5 font-mono">
            <div className="col-start-2 flex justify-between">
              <span>🌄</span>
              <span>🌃</span>
            </div>
            <div className="text-right text-sm">2022-01-17</div>
            <div>⬜⬜🟨⬜🟩⬜</div>
            <div className="text-right text-sm">2022-01-18</div>
            <div>⬜⬜🟩🟩🟩⬜</div>
            <div className="text-right text-sm">2022-01-19</div>
            <div>⬜⬜🟩🟩🟩⬜</div>
            <div className="text-right text-sm">2022-01-20</div>
            <div>⬜⬜🟩🟩⬜⬜</div>
            <div className="text-right text-sm">2022-01-21</div>
            <div>⬜⬜🟨🟨🟩⬜</div>
          </div>
          <p>
            Each square is a 4-hour chunk starting from 00:00 to 23:59. They are
            colored according to the{" "}
            <Link
              to="https://en.wikipedia.org/wiki/52/17_rule"
              className="font-bold"
            >
              52/17 rule
            </Link>
            : ⬜ means no activity, 🟩 means within the 52/17 ratio, and 🟨
            means over it.
          </p>
        </div>
        <input type="text" name="apiToken" placeholder="API Token" />
        <button
          className="rounded-full bg-[#E57CD8] text-xl leading-loose text-white"
          type="submit"
        >
          Set token
        </button>
      </Form>
    );
  }

  return (
    <>
      <div className="text-sm">
        Hello {data.me.email}!{" "}
        <Link to="/clear-token" className="underline">
          Change user
        </Link>
      </div>
      <Form className="flex flex-col gap-y-5">
        <div className="flex gap-x-5">
          <div>
            <h3 className="text-sm">Workspace</h3>
            <select name="workspace" defaultValue={data.params.workspace}>
              <option value="">Select workspace</option>
              {data.workspaces.map((workspace: any) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <h3 className="text-sm">Start of week</h3>
            <input
              type="date"
              name="since"
              placeholder="Select date"
              defaultValue={data.params.since}
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-full bg-[#E57CD8] text-xl leading-loose text-white"
        >
          Get report
        </button>
      </Form>
      {data.squares.length ? (
        <div className="grid grid-cols-2 items-center gap-x-5">
          <div className="col-start-2 flex justify-between">
            <span>🌄</span>
            <span>🌃</span>
          </div>
          {data.squares.map(([date, squares], i) => (
            <Fragment key={i}>
              <div className="font-mono text-sm">{date}</div>
              <div className="text-center">{squares.join("")}</div>
            </Fragment>
          ))}
        </div>
      ) : null}
    </>
  );
}
