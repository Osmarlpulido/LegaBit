import { z } from "zod";

export const healthLiveResponseSchema = z.object({ status: z.literal("ok") });

export const healthReadyResponseSchema = z.object({
  status: z.literal("ready"),
  dependencies: z.object({ mongodb: z.literal("up") })
});

export type HealthLiveResponse = z.infer<typeof healthLiveResponseSchema>;
export type HealthReadyResponse = z.infer<typeof healthReadyResponseSchema>;
