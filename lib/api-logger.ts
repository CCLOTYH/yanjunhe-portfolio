function resourceIdFromBody(body: unknown): string {
  if (typeof body !== "object" || body === null) {
    return "";
  }
  const record = body as Record<string, unknown>;
  const nested = ["project", "blog", "milestone", "contact"].find(
    (key) => typeof record[key] === "object" && record[key] !== null,
  );
  const source =
    nested !== undefined
      ? (record[nested] as Record<string, unknown>)
      : record;
  const id =
    source.slug ??
    source.id ??
    "";
  return typeof id === "string" ? id : String(id);
}

export async function logApiResponse(
  response: Response,
  method: string,
  resource: string,
): Promise<Response> {
  let detail = "";
  try {
    const body = await response.clone().json();
    if (Array.isArray(body)) {
      detail = ` count=${body.length}`;
    } else {
      const id = resourceIdFromBody(body);
      if (id) {
        detail = ` id=${id}`;
      }
      const message = (body as Record<string, unknown>)?.message;
      if (!id && typeof message === "string") {
        detail = ` message="${message}"`;
      }
    }
  } catch {
    detail = "";
  }
  const timestamp = new Date().toISOString();
  console.log(
    `[api] ${timestamp} ${method} ${resource} -> ${response.status}${detail}`,
  );
  return response;
}
