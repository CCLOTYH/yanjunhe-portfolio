import {
  handleProjectsDelete,
  handleProjectsGet,
  handleProjectsPatch,
  handleProjectsPost,
} from "@/lib/project-api";
import { logApiResponse } from "@/lib/api-logger";

export async function GET(): Promise<Response> {
  return logApiResponse(await handleProjectsGet(), "GET", "/api/projects");
}

export async function POST(request: Request): Promise<Response> {
  return logApiResponse(await handleProjectsPost(request), "POST", "/api/projects");
}

export async function PATCH(request: Request): Promise<Response> {
  return logApiResponse(await handleProjectsPatch(request), "PATCH", "/api/projects");
}

export async function DELETE(request: Request): Promise<Response> {
  return logApiResponse(await handleProjectsDelete(request), "DELETE", "/api/projects");
}
