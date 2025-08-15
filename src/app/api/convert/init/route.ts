import CloudConvert from "cloudconvert";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { inputFormat, outputFormat } = await req.json();
    if (!outputFormat || !inputFormat) {
      return Response.json(
        { error: "There was no output format given, please try again" },
        { status: 400 }
      );
    }
    const cc = new CloudConvert(process.env.CLOUDCONVERT_API_KEY!);
    const job = await cc.jobs.create({
      tasks: {
        import: { operation: "import/upload" },
        convert: {
          operation: "convert",
          input: "import",
          input_format: inputFormat,
          output_format: outputFormat,
        },
        export: { operation: "export/url", input: "convert" },
      },
    });
    const uploadTask = job.tasks.find((task) => task.name === "import");
    if (!uploadTask?.result?.form) {
      return Response.json(
        { error: "No upload form returned" },
        { status: 500 }
      );
    }
    const { url, parameters } = uploadTask?.result?.form;
    return Response.json({
      jobID: job.id,
      upload: { url, fields: parameters },
    });
  } catch (err) {
    return Response.json(
      {
        error: "There was an error trying to initalize the conversion tasks",
      },
      { status: 500 }
    );
  }
}
