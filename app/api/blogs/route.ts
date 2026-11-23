import {
  handleBlogsDelete,
  handleBlogsGet,
  handleBlogsPatch,
  handleBlogsPost,
} from "@/lib/blog-api";
import { logApiResponse } from "@/lib/api-logger";

export async function GET(): Promise<Response> {
  return logApiResponse(await handleBlogsGet(), "GET", "/api/blogs");
}

export async function POST(request: Request): Promise<Response> {
  return logApiResponse(await handleBlogsPost(request), "POST", "/api/blogs");
}

export async function PATCH(request: Request): Promise<Response> {
  return logApiResponse(await handleBlogsPatch(request), "PATCH", "/api/blogs");
}

export async function DELETE(request: Request): Promise<Response> {
  return logApiResponse(await handleBlogsDelete(request), "DELETE", "/api/blogs");
}
