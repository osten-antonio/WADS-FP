type StepItem = {
    step: string;
    explanation: string;
};
export declare function getLongHashFromShort(short: string): Promise<string | null>;
export declare function setShortToLong(short: string, longHash: string, ttl?: number): Promise<"OK">;
export declare function getSubmissionIdFromLongHash(longHash: string): Promise<string | null>;
export declare function setSubmissionIdForLongHash(longHash: string, submissionId: string, ttl?: number): Promise<"OK">;
export declare function getAnswerByQuestion(question: string): Promise<{
    answer: string;
    submissionId?: string;
} | null>;
export declare function setAnswerForQuestionWithSubmissionId(question: string, answer: string, submissionId: string, ttl?: number): Promise<void>;
export declare function getStepsForQuestion(question: string): Promise<StepItem[] | null>;
export declare function setStepsForQuestion(question: string, steps: StepItem[], submissionId?: string, ttl?: number): Promise<void>;
export declare function getPracticeListForQuestion(question: string): Promise<string[]>;
export declare function appendPracticeListForQuestion(question: string, items: string[], ttl?: number): Promise<void>;
export declare function ensurePracticeItems(question: string, category: string, count: number, generator: (q: string, c: string, n: number) => Promise<string[]>): Promise<string[]>;
declare const _default: {
    getAnswerByQuestion: typeof getAnswerByQuestion;
    setAnswerForQuestionWithSubmissionId: typeof setAnswerForQuestionWithSubmissionId;
    getStepsForQuestion: typeof getStepsForQuestion;
    setStepsForQuestion: typeof setStepsForQuestion;
    getPracticeListForQuestion: typeof getPracticeListForQuestion;
    appendPracticeListForQuestion: typeof appendPracticeListForQuestion;
    ensurePracticeItems: typeof ensurePracticeItems;
    getLongHashFromShort: typeof getLongHashFromShort;
    getSubmissionIdFromLongHash: typeof getSubmissionIdFromLongHash;
};
export default _default;
//# sourceMappingURL=cache.service.d.ts.map