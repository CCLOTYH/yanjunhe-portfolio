import {
  handleContactPost,
  handleContactsDelete,
  handleContactsGet,
  handleContactsPatch,
} from "@/lib/contact-api";
import { logApiResponse } from "@/lib/api-logger";

export async function GET(): Promise<Response> {
  return logApiResponse(await handleContactsGet(), "GET", "/api/contacts");
}

export async function POST(request: Request): Promise<Response> {
  return logApiResponse(await handleContactPost(request), "POST", "/api/contacts");
}

export async function PATCH(request: Request): Promise<Response> {
  return logApiResponse(await handleContactsPatch(request), "PATCH", "/api/contacts");
}

export async function DELETE(request: Request): Promise<Response> {
  return logApiResponse(await handleContactsDelete(request), "DELETE", "/api/contacts");
}
