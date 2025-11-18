import { router, publicProcedure } from "../_core/trpc";
import { ENV } from "../_core/env";

export const configRouter = router({
  getGeminiKey: publicProcedure.query(() => {
    return { apiKey: ENV.geminiApiKey };
  }),
});
