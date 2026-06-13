# File Converter

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

A free, ad-free file converter. Upload a file, pick a target format, and download the
result. Conversion runs through the [CloudConvert](https://cloudconvert.com) API, and the
file is uploaded straight to CloudConvert from the browser so it never sits on this server.

## Features

- Converts between 18 formats across documents, spreadsheets, presentations, and images:
  PDF, DOCX, RTF, TXT, PPTX, XLSX, CSV, ODS, PNG, JPG, JPEG, WEBP, AVIF, GIF, TIFF, BMP, ICO, SVG.
- Direct-to-CloudConvert upload: the API route only creates the job and hands back a signed
  upload form, so the file bytes go to CloudConvert, not through this app.
- Status polling: the client polls a status route about every 1.2s until the job finishes,
  then surfaces a download link.

## How it works

1. `POST /api/convert/init` creates a CloudConvert job (`import/upload` to `convert` to
   `export/url`) with the chosen input and output formats and returns the job id plus the
   signed upload form.
2. The browser uploads the file to CloudConvert using that form.
3. `GET /api/convert/status?jobID=...` reports progress; on `finished` it returns the export
   URL, which the UI shows as a download button.

## Tech stack

- **Next.js (App Router) + React + TypeScript**
- **Tailwind CSS + daisyUI** for the UI
- **CloudConvert SDK** for the conversion jobs

## Run it

This app needs a CloudConvert API key. Create a free key at
[cloudconvert.com](https://cloudconvert.com/dashboard/api/v2/keys), then:

```bash
npm install
echo "CLOUDCONVERT_API_KEY=your_key_here" > .env.local
npm run dev        # http://localhost:3000
```

## Project layout

```
src/app/
  page.tsx                       # upload UI, format dropdown, polling client
  api/convert/init/route.ts      # creates the CloudConvert job, returns the upload form
  api/convert/status/route.ts    # polls job status, returns the export URL
```
