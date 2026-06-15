import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/api/docs",
    "/api/docs/",
    "/api/docs/:path*",
    "/api/openapi.json",
    "/api/swagger-ui-bundle.js",
    "/api/swagger-ui-standalone-preset.js",
    "/api/swagger-ui-init.js",
    "/api/swagger-ui.css",
    "/api/favicon-32x32.png",  // swagger also loads this
  ],
};
export async function proxy(request: NextRequest) {
  const backendProtocol = process.env.BACKEND_PROTOCOL ?? "http";
  const backendHostname = process.env.BACKEND_HOSTNAME ?? "localhost";
  const backendPort = process.env.BACKEND_PORT ?? "8000";
  const backendUrl = `${backendProtocol}://${backendHostname}:${backendPort}`;

  const path = request.nextUrl.pathname.replace(/^\/api/, "");
  const search = request.nextUrl.search;

  let currentUrl = `${backendUrl}${path}${search}`;
  let res: Response;

  for (let i = 0; i < 5; i++) {
    res = await fetch(currentUrl, {
      method: request.method,
      headers: Object.fromEntries(
        [...request.headers.entries()].filter(
          ([key]) => !["host", "connection"].includes(key.toLowerCase())
        )
      ),
      redirect: "manual",
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (location) {
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }
    }
    break;
  }

  const responseHeaders = new Headers();
  res!.headers.forEach((value, key) => {
    if (!["content-encoding", "transfer-encoding"].includes(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(res!.body, {
    status: res!.status,
    statusText: res!.statusText,
    headers: responseHeaders,
  });
}
