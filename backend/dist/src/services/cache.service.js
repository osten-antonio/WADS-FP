import { redis } from "../lib/redis";
import { createHash } from "crypto";
const DEFAULT_TTL = parseInt(process.env.REDIS_TTL_SECONDS ?? "604800", 10); // 7 days
function longHashFor(text) {
    return createHash("sha256").update(text).digest("hex");
}
export async function getLongHashFromShort(short) {
    return await redis.get(`hash:${short}`);
}
export async function setShortToLong(short, longHash, ttl = DEFAULT_TTL) {
    // map short (submission id) -> longHash
    return await redis.set(`hash:${short}`, longHash, "EX", ttl);
}
export async function getSubmissionIdFromLongHash(longHash) {
    return await redis.get(`hash_rev:${longHash}`);
}
export async function setSubmissionIdForLongHash(longHash, submissionId, ttl = DEFAULT_TTL) {
    return await redis.set(`hash_rev:${longHash}`, submissionId, "EX", ttl);
}
export async function getAnswerByQuestion(question) {
    const long = longHashFor(question);
    const v = await redis.get(`answer:${long}`);
    if (!v)
        return null;
    const submissionId = await getSubmissionIdFromLongHash(long);
    if (submissionId == null) {
        return { answer: v };
    }
    return { answer: v, submissionId };
}
export async function setAnswerForQuestionWithSubmissionId(question, answer, submissionId, ttl = DEFAULT_TTL) {
    const long = longHashFor(question);
    await redis.set(`answer:${long}`, answer, "EX", ttl);
    await setShortToLong(submissionId, long, ttl);
    await setSubmissionIdForLongHash(long, submissionId, ttl);
}
export async function getStepsForQuestion(question) {
    const long = longHashFor(question);
    const v = await redis.get(`steps:${long}`);
    if (!v)
        return null;
    try {
        return JSON.parse(v);
    }
    catch (e) {
        return null;
    }
}
export async function setStepsForQuestion(question, steps, submissionId, ttl = DEFAULT_TTL) {
    const long = longHashFor(question);
    await redis.set(`steps:${long}`, JSON.stringify(steps), "EX", ttl);
    if (submissionId) {
        await setShortToLong(submissionId, long, ttl);
        await setSubmissionIdForLongHash(long, submissionId, ttl);
    }
}
export async function getPracticeListForQuestion(question) {
    const long = longHashFor(question);
    const items = await redis.lrange(`practice:${long}`, 0, -1);
    return items ?? [];
}
export async function appendPracticeListForQuestion(question, items, ttl = DEFAULT_TTL) {
    if (!items || items.length === 0)
        return;
    const long = longHashFor(question);
    await redis.rpush(`practice:${long}`, ...items);
    // set TTL on the list key
    await redis.expire(`practice:${long}`, ttl);
}
export async function ensurePracticeItems(question, category, count, generator) {
    const existing = await getPracticeListForQuestion(question);
    if (existing.length >= count)
        return existing.slice(0, count);
    const need = count - existing.length;
    const generated = await generator(question, category, need);
    if (generated.length > 0) {
        await appendPracticeListForQuestion(question, generated);
    }
    const updated = await getPracticeListForQuestion(question);
    return updated.slice(0, count);
}
export default {
    getAnswerByQuestion,
    setAnswerForQuestionWithSubmissionId,
    getStepsForQuestion,
    setStepsForQuestion,
    getPracticeListForQuestion,
    appendPracticeListForQuestion,
    ensurePracticeItems,
    getLongHashFromShort,
    getSubmissionIdFromLongHash,
};
//# sourceMappingURL=cache.service.js.map