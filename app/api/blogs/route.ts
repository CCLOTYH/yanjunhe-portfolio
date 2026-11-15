import { handleBlogsGet, handleBlogsPost } from "@/lib/blog-api";

export async function GET(): Promise<Response> {
  return handleBlogsGet();
}

export async function POST(request: Request): Promise<Response> {
  return handleBlogsPost(request);
}
