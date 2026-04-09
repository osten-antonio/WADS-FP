type IngestionResult = {
    question: string;
};
export declare function processImageUpload(file: Express.Multer.File): Promise<IngestionResult>;
export declare function processTextUpload(text: string, candidateCategory?: string): Promise<IngestionResult>;
export {};
//# sourceMappingURL=ingestion.service.d.ts.map