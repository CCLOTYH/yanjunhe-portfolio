import { handleContactPost } from "@/lib/contact-api";

export async function POST(request: Request): Promise<Response> {
  return handleContactPost(request);
}
