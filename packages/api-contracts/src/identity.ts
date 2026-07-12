import { z } from "zod";

export const currentUserResponseSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    email: z.string().email(),
    name: z.string(),
    image: z.string().url().nullable()
  }),
  session: z.object({ expiresAt: z.string().datetime() })
});

export type CurrentUserResponse = z.infer<typeof currentUserResponseSchema>;
