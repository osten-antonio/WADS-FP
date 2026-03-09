-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SolverType" AS ENUM ('MATHJS', 'LLM');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('GUEST', 'USER');

-- CreateEnum
CREATE TYPE "InputType" AS ENUM ('TEXT', 'IMAGE');

-- CreateTable
CREATE TABLE "UserAccount" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemSubmission" (
    "id" UUID NOT NULL,
    "inputType" "InputType" NOT NULL,
    "rawText" TEXT,
    "imageUrl" TEXT,
    "topicSelected" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SubmissionStatus" NOT NULL,
    "userId" UUID,

    CONSTRAINT "ProblemSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolveResult" (
    "id" UUID NOT NULL,
    "solverUsed" "SolverType" NOT NULL,
    "finalAnswer" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submissionId" UUID NOT NULL,

    CONSTRAINT "SolveResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Step" (
    "id" UUID NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "math" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "solveResultId" UUID NOT NULL,

    CONSTRAINT "Step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hint" (
    "id" UUID NOT NULL,
    "hintLevel" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "solveResultId" UUID NOT NULL,

    CONSTRAINT "Hint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationSuggestion" (
    "id" UUID NOT NULL,
    "concept" TEXT NOT NULL,
    "advice" TEXT NOT NULL,
    "solveResultId" UUID NOT NULL,

    CONSTRAINT "RecommendationSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeSet" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "solveResultId" UUID NOT NULL,

    CONSTRAINT "PracticeSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeQuestion" (
    "id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "practiceSetId" UUID NOT NULL,

    CONSTRAINT "PracticeQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAccount_email_key" ON "UserAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SolveResult_submissionId_key" ON "SolveResult"("submissionId");

-- AddForeignKey
ALTER TABLE "ProblemSubmission" ADD CONSTRAINT "ProblemSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolveResult" ADD CONSTRAINT "SolveResult_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "ProblemSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_solveResultId_fkey" FOREIGN KEY ("solveResultId") REFERENCES "SolveResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hint" ADD CONSTRAINT "Hint_solveResultId_fkey" FOREIGN KEY ("solveResultId") REFERENCES "SolveResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationSuggestion" ADD CONSTRAINT "RecommendationSuggestion_solveResultId_fkey" FOREIGN KEY ("solveResultId") REFERENCES "SolveResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeSet" ADD CONSTRAINT "PracticeSet_solveResultId_fkey" FOREIGN KEY ("solveResultId") REFERENCES "SolveResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeQuestion" ADD CONSTRAINT "PracticeQuestion_practiceSetId_fkey" FOREIGN KEY ("practiceSetId") REFERENCES "PracticeSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
