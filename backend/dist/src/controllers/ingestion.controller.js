import { ingestionImage, ingestionText, ingestionResponse } from "../schemas/ingestion.schema";
import { processImageUpload, processTextUpload } from "../services/ingestion.service";
import solverService from "../services/solver.service";
import { randomUUID } from "crypto";
import { solveResponse } from "../schemas/solve.schema";
import { call_ollama } from "../services/ollama.service";
import { recordSubmission } from "../services/user.service";
import * as cacheService from "../services/cache.service";
import { adminAuth } from "../lib/firebase-admin";
async function tryRecordSubmissionFromRequest(req, submission) {
    try {
        const authorization = req.header("authorization")?.trim();
        if (!authorization?.toLowerCase().startsWith("bearer "))
            return null;
        const token = authorization.slice(7).trim();
        let decoded;
        try {
            decoded = await adminAuth.verifyIdToken(token, true);
        }
        catch {
            decoded = await adminAuth.verifySessionCookie(token, true);
        }
        if (!decoded?.uid)
            return null;
        const userId = decoded.uid;
        const displayName = decoded.name?.trim() || decoded.email?.split("@")[0] || userId;
        try {
            const ps = await recordSubmission(userId, submission, displayName);
            return ps?.id ?? null;
        }
        catch (e) {
            console.error("Failed to record submission", e);
            return null;
        }
    }
    catch (e) {
        console.error("Auth/recording error (ignored):", e);
        return null;
    }
}
// Validate middleware will run to validate category
export async function handleImageUpload(req, res) {
    try {
        // multer puts the file on req.file
        const file = req.file;
        if (!file)
            return res.status(400).json({ message: "No image uploaded" });
        // validate using zod schema shape
        ingestionImage.parse({ image: [file] });
        const result = await processImageUpload(file);
        const out = ingestionResponse.parse({ question: result.question });
        return res.status(201).json(out);
    }
    catch (err) {
        return res.status(400).json({ message: err?.message ?? String(err) });
    }
}
export async function handleTextUpload(req, res) {
    try {
        const parsed = ingestionText.parse(req.body);
        const result = await processTextUpload(parsed.question, parsed.category);
        try {
            // Check cache first
            const cached = await cacheService.getAnswerByQuestion(result.question);
            if (cached) {
                let submissionId = cached.submissionId ?? null;
                if (!submissionId) {
                    submissionId = randomUUID();
                    try {
                        await cacheService.setAnswerForQuestionWithSubmissionId(result.question, cached.answer, submissionId);
                    }
                    catch (e) {
                        console.error('Failed to set cache mapping for existing answer', e);
                    }
                }
                // record history if authenticated (links user to existing submission)
                await tryRecordSubmissionFromRequest(req, {
                    id: submissionId,
                    inputMode: "TEXT",
                    category: parsed.category ?? "General",
                    type: "CACHE",
                    subtype: null,
                    text: result.question,
                });
                return res.json(solveResponse.parse({ answer: cached.answer, id: submissionId }));
            }
            const result_answer = await solverService.tryMathSolve(result.question);
            if (result_answer.solved) {
                let id = randomUUID();
                const submissionObj = {
                    id,
                    inputMode: "TEXT",
                    category: parsed.category ?? "General",
                    type: "INGESTION",
                    subtype: null,
                    text: result.question,
                };
                // Try to record for authenticated user (will create user + history)
                const recordedId = await tryRecordSubmissionFromRequest(req, submissionObj);
                if (recordedId) {
                    id = recordedId;
                }
                // cache the answer for future requests (map submission id -> long hash)
                try {
                    await cacheService.setAnswerForQuestionWithSubmissionId(result.question, result_answer.answer, id);
                }
                catch (e) {
                    console.error('Failed to cache answer', e);
                }
                return res.json(solveResponse.parse({ answer: result_answer.answer, id }));
            }
            const prompt = `
			Solve the following math question and 
			return ONLY valid JSON matching the schema {\n  "answer": "<string>",\n  "id": "<string>"\n}
			If it is a math question but unsolvable, respond with exactly "None"
			If it is not a math question, respond with "Not a math question" 
			Question: ${result.question}`;
            const aiResp = await call_ollama(prompt, solveResponse);
            if (JSON.stringify(aiResp).includes("Not a math question")) {
                throw Error('Not a math question');
            }
            if (aiResp?.id) {
                // We will create our own submission id and persist it
                let id = randomUUID();
                const submissionObj = {
                    id,
                    inputMode: "TEXT",
                    category: parsed.category ?? "General",
                    type: "INGESTION",
                    subtype: null,
                    text: result.question,
                };
                const recordedId = await tryRecordSubmissionFromRequest(req, submissionObj);
                if (recordedId) {
                    id = recordedId;
                }
                try {
                    await cacheService.setAnswerForQuestionWithSubmissionId(result.question, aiResp.answer, id);
                }
                catch (e) {
                    console.error('Failed to cache AI answer', e);
                }
                // return the AI response but ensure it contains our submission id
                aiResp.id = id;
            }
            return res.json(aiResp);
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({ message: err?.message ?? 'Internal error' });
        }
    }
    catch (err) {
        return res.status(400).json({ message: err?.message ?? String(err) });
    }
}
//# sourceMappingURL=ingestion.controller.js.map