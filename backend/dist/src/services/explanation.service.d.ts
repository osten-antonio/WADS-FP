import { type stepsRequest, type explanationRequest, type followUpRequest } from "../schemas/explanation.schema";
import * as z from 'zod';
export declare function generateSteps(data: z.infer<typeof stepsRequest>): Promise<Record<string, any>>;
export declare function generateHints(data: z.infer<typeof stepsRequest>): Promise<Record<string, any>>;
export declare function generateStepExplanation(data: z.infer<typeof explanationRequest>): Promise<Record<string, any>>;
export declare function generateFollowUp(data: z.infer<typeof followUpRequest>): Promise<Record<string, any>>;
//# sourceMappingURL=explanation.service.d.ts.map