import CloudConvert from "cloudconvert";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const jobID = searchParams.get("jobID");
    if (!jobID) {
      return Response.json({ error: "jobID is required" }, { status: 400 });
    }

    const cc = new CloudConvert(process.env.CLOUDCONVERT_API_KEY!);

    const finishedJobs = await cc.jobs.wait(jobID);

    if (finishedJobs.status === "error") {
      const failing = finishedJobs.tasks.find((t) => t.status === "error");
      return Response.json(
        {
          status: "error",
        },
        { status: 500 }
      );
    }
    const exportTask = finishedJobs.tasks.find(
      (task) => task.name === "export" && task.status === "finished"
    );

    const file = exportTask?.result?.files?.[0];
    if (!exportTask || !file?.url) {
      // Not ready: tell the client what's happening
      return Response.json(
        {
          status: finishedJobs.status,
          tasks: finishedJobs.tasks.map((t) => ({
            name: t.name,
            op: t.operation,
            status: t.status,
          })),
        },
        { status: 202 }
      );
    }
    return Response.json({
      status: "finished",
      downloadUrl: file?.url,
    });
  } catch (err) {
    return Response.json({ error: err }, { status: 500 });
  }
}
