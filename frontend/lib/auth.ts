import { cookies } from "next/headers";
import { backendApi } from "./axios";

type SessionPayload = {
  uid: string;
  email?: string;
};

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (!session) return null;

  try {
    // We call a fast verify-session endpoint on our backend 
    // to keep all Firebase Admin interactions purely in the backend.
    const res = await backendApi.get("/users/verify-session", {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    return res.data;
  } catch (error) {
    console.error("Failed to verify session via backend", error);
    return null;
  }
}
