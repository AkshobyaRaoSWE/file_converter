"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState("Click ⬇️");
  const [downloadURL, setDownloadURL] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [confirm, setConfirm] = useState(false);
  async function handleConvert(e: React.FormEvent) {
    e.preventDefault();
    if (!file || output == "Click ⬇️" || confirm) return;
    setDownloadURL("");
    const initRes = await fetch("/api/convert/init", {
      method: "POST",
      body: JSON.stringify({
        inputFormat: file.name.split(".").pop()?.toLowerCase(), // e.g., "docx", "png"
        outputFormat: output,
        apiKey: apiKey,
      }),
    });

    if (!initRes.ok) {
      console.log("Init response didn't work");
      return;
    }
    const { jobID, upload } = await initRes.json();
    const form = new FormData();
    Object.entries(upload.fields).forEach(([k, v]) =>
      form.append(k, String(v))
    );

    form.append("file", file);

    const uploadFile = await fetch(upload.url, { method: "POST", body: form });

    if (!uploadFile.ok) {
      console.warn("There was an error uplaoding the file");
    }

    const poll = async (): Promise<void> => {
      const r = await fetch(
        `/api/convert/status?jobID=${encodeURIComponent(jobID)}`,
        {
          cache: "no-store",
          body: JSON.stringify({
            apiKey: apiKey,
          }),
        }
      );
      if (r.status === 202) {
        setTimeout(poll, 1200);
        return;
      }
      if (!r.ok) {
        console.log("There was an error getting status");
        return;
      }
      const data = await r.json();
      if (data.status === "finished" && data.downloadUrl) {
        setDownloadURL(data.downloadUrl);
        console.log("Finished with no errors!");
      } else if (data.status === "error") {
        console.error("Conversion failed:", data.message);
        return;
      } else {
        setTimeout(poll, 1200);
      }
    };
    await poll();
  }
  return (
    <main>
      <div className="flex items-center justify-center gap-5 mb-7">
        <input
          type="text"
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="API key"
          className="input w-full"
          disabled={confirm}
        />
        <button
          className="btn btn-primary rounded-md"
          onClick={() => setConfirm(!confirm)}
        >
          {confirm ? "Edit" : "Confirm"}
        </button>
      </div>
      <form
        onSubmit={handleConvert}
        className="flex items-center justify-center gap-5 bg-gray-100 p-6 rounded-md"
      >
        {!file ? (
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className={
              "file:btn file:btn-primary file:rounded-md w-55 text-transparent -mr-30"
            }
          />
        ) : (
          <p className="file:hidden file:text-transparent  font-extrabold">
            {file.name.slice(0, 15) + "..."}
          </p>
        )}

        <div className="dropdown dropdown-start">
          <div
            tabIndex={0}
            role="button"
            className="btn m-1 btn-secondary  rounded-md"
          >
            {output.toUpperCase()}
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm max-h-60 overflow-y-auto"
          >
            {/* Documents */}
            <li onClick={() => setOutput("pdf")}>
              <a>PDF</a>
            </li>
            <li onClick={() => setOutput("docx")}>
              <a>DOCX</a>
            </li>

            <li onClick={() => setOutput("rtf")}>
              <a>RTF</a>
            </li>
            <li onClick={() => setOutput("txt")}>
              <a>TXT</a>
            </li>

            {/* Presentations */}
            <li onClick={() => setOutput("pptx")}>
              <a>PPTX</a>
            </li>

            {/* Spreadsheets */}
            <li onClick={() => setOutput("xlsx")}>
              <a>XLSX</a>
            </li>
            <li onClick={() => setOutput("csv")}>
              <a>CSV</a>
            </li>
            <li onClick={() => setOutput("ods")}>
              <a>ODS</a>
            </li>

            {/* Images */}
            <li onClick={() => setOutput("png")}>
              <a>PNG</a>
            </li>
            <li onClick={() => setOutput("jpg")}>
              <a>JPG</a>
            </li>
            <li onClick={() => setOutput("jpeg")}>
              <a>JPEG</a>
            </li>
            <li onClick={() => setOutput("webp")}>
              <a>WEBP</a>
            </li>
            <li onClick={() => setOutput("avif")}>
              <a>AVIF</a>
            </li>
            <li onClick={() => setOutput("gif")}>
              <a>GIF</a>
            </li>
            <li onClick={() => setOutput("tiff")}>
              <a>TIFF</a>
            </li>
            <li onClick={() => setOutput("bmp")}>
              <a>BMP</a>
            </li>
            <li onClick={() => setOutput("ico")}>
              <a>ICO</a>
            </li>
            <li onClick={() => setOutput("svg")}>
              <a>SVG</a>
            </li>
          </ul>
        </div>
        <button
          type="submit"
          disabled={!file}
          className="btn btn-primary rounded-md"
        >
          Convert
        </button>
        {downloadURL && (
          <a
            href={downloadURL}
            download
            className="btn btn-accent rounded-md text-white"
            onClick={() => {
              setFile(null);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 306.7L246.6 265.3C234.1 252.8 213.8 252.8 201.3 265.3C188.8 277.8 188.8 298.1 201.3 310.6L297.3 406.6C309.8 419.1 330.1 419.1 342.6 406.6L438.6 310.6C451.1 298.1 451.1 277.8 438.6 265.3C426.1 252.8 405.8 252.8 393.3 265.3L352 306.7L352 96zM160 384C124.7 384 96 412.7 96 448L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 448C544 412.7 515.3 384 480 384L433.1 384L376.5 440.6C345.3 471.8 294.6 471.8 263.4 440.6L206.9 384L160 384zM464 440C477.3 440 488 450.7 488 464C488 477.3 477.3 488 464 488C450.7 488 440 477.3 440 464C440 450.7 450.7 440 464 440z" />
            </svg>
          </a>
        )}
      </form>
    </main>
  );
}
