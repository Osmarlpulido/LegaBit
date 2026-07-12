import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";

import type { AuthService } from "../modules/identity/auth.js";

export function registerAuthRoutes(app: FastifyInstance, auth: AuthService): void {
  app.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      const authRequest = toWebRequest(request);
      const response = await auth.handler(authRequest);
      return sendWebResponse(reply, response);
    }
  });
}

export function toAuthHeaders(request: FastifyRequest): Headers {
  return fromNodeHeaders(request.headers);
}

function toWebRequest(request: FastifyRequest): Request {
  const protocol = request.protocol;
  const host = request.headers.host ?? "localhost";
  const url = new URL(request.raw.url ?? request.url, `${protocol}://${host}`);
  const body = request.body === undefined ? undefined : JSON.stringify(request.body);

  return new Request(url, {
    method: request.method,
    headers: fromNodeHeaders(request.headers),
    body
  });
}

async function sendWebResponse(reply: FastifyReply, response: Response) {
  response.headers.forEach((value, name) => {
    if (name.toLowerCase() !== "set-cookie") reply.header(name, value);
  });

  const cookies = response.headers.getSetCookie();
  if (cookies.length > 0) reply.header("set-cookie", cookies);

  reply.status(response.status);
  const body = await response.text();
  return reply.send(body || null);
}
