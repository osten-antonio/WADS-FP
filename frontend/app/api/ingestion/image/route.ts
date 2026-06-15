import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const backendUrl = `${process.env.BACKEND_PROTOCOL ?? "http"}://${process.env.BACKEND_HOSTNAME ?? "localhost"}:${process.env.BACKEND_PORT ?? "8000"}`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const backendFormData = new FormData();
    const imageFile = formData.get("image");
    if (imageFile instanceof File) {
      backendFormData.append("image", imageFile, imageFile.name);
    } else {
      return NextResponse.json({ message: "No image provided" }, { status: 400 });
    }

    const authorization = req.headers.get("Authorization");

    const headers: Record<string, string> = {};
    if (authorization) {
      headers.Authorization = authorization;
    }

    const backendResponse = await axios.post(`${backendUrl}/ingestion/image`, backendFormData, {
      headers,
      timeout: 30000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return NextResponse.json(backendResponse.data, { status: backendResponse.status });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return NextResponse.json({ message: "Image upload timed out" }, { status: 504 });
      }
      if (error.response) {
        return NextResponse.json(error.response.data, { status: error.response.status });
      }
    }
    return NextResponse.json({ message: "Failed to connect to backend" }, { status: 502 });
  }
}
