import { z } from "zod";

import { SESSION_CODE_EXAMPLE } from "./constants";

export const JoinSessionSchema = z.object({
  sessionCode: z
    .string()
    .min(1, "Please enter a session code")
    .regex(/^X-[A-Z0-9]{5}$/, `Please enter a valid session code (e.g. ${SESSION_CODE_EXAMPLE})`)
});
