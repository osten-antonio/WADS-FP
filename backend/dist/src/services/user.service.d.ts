export type HistoryItem = {
    id: string;
    inputMode: "TEXT" | "IMAGE";
    category: string;
    type: string;
    subtype: string | null;
    text: string;
    createdAt: string;
};
export type UserRecord = {
    firebaseUID: string;
    displayName: string;
};
export type SyncUserAccountInput = {
    firebaseUID: string;
    displayName: string;
};
export declare function syncUserAccount(input: SyncUserAccountInput): Promise<UserRecord>;
export declare function getUserById(userId: string): Promise<UserRecord | null>;
export declare function getUserHistory(userId: string, category?: string): Promise<HistoryItem[]>;
export declare function getUserProfile(userId: string): Promise<{
    user: UserRecord;
    history: HistoryItem[];
} | null>;
export declare function updateDisplayName(userId: string, displayName: string): Promise<UserRecord | null>;
export declare function updateUserDisplayName(firebaseUID: string, displayName: string): Promise<UserRecord>;
export declare function recordSubmission(userId: string | undefined | null, submission: {
    id: string;
    inputMode: "TEXT" | "IMAGE";
    category?: string | null;
    type?: string | null;
    subtype?: string | null;
    text: string;
}, displayName?: string): Promise<any>;
export declare function deleteUserHistory(userId: string, submissionIds?: string[]): Promise<number>;
//# sourceMappingURL=user.service.d.ts.map