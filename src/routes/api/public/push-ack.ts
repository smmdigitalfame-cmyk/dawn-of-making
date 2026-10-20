import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Delivery receipt from the phone's notification worker. Only logs a short,
// non-sensitive status line (no user data) so delivery problems can be diagnosed.
const Ack = z.object({
  id: z.string().max(64),
  stage: z.enum(["received", "shown", "failed"]),
  error: z.string().max(200).optional(),
  permission: z.string().max(20).optional(),
});

export const Route = createFileRoute("/api/public/push-ack")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const a = Ack.parse(await request.json());
          console.log(`[push-ack] id=${a.id} stage=${a.stage} perm=${a.permission ?? "?"} err=${a.error ?? ""}`);
        } catch {
          return new Response("bad", { status: 400 });
        }
        return new Response("ok");
      },
    },
  },
});
