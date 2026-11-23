import {
  handleMilestonesDelete,
  handleMilestonesGet,
  handleMilestonesPatch,
  handleMilestonesPost,
  handleMilestonesPut,
} from "@/lib/milestone-api";
import { logApiResponse } from "@/lib/api-logger";

export async function GET(): Promise<Response> {
  return logApiResponse(await handleMilestonesGet(), "GET", "/api/milestones");
}

export async function POST(request: Request): Promise<Response> {
  return logApiResponse(await handleMilestonesPost(request), "POST", "/api/milestones");
}

export async function PUT(request: Request): Promise<Response> {
  return logApiResponse(await handleMilestonesPut(request), "PUT", "/api/milestones");
}

export async function PATCH(request: Request): Promise<Response> {
  return logApiResponse(await handleMilestonesPatch(request), "PATCH", "/api/milestones");
}

export async function DELETE(request: Request): Promise<Response> {
  return logApiResponse(await handleMilestonesDelete(request), "DELETE", "/api/milestones");
}
