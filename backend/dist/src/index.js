import 'dotenv/config';
import express, {} from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import ingestionRouter from "./routes/ingestion.routes";
import solverRouter from "./routes/solver.routes";
import explanationRouter from "./routes/explanation.routes";
import practiceRouter from "./routes/practice.routes";
import userRouter from "./routes/user.routes";
import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first');
// Zod schemas
import * as z from 'zod';
import { ingestionText, ingestionImage, ingestionResponse } from "./schemas/ingestion.schema";
import { solveRequest, solveResponse } from "./schemas/solve.schema";
import { stepsRequest, stepsResponse, hintResponse, explanationRequest, explanationResponse, followUpRequest } from "./schemas/explanation.schema";
import { practiceRequest, practiceResponse, practiceRefresh } from "./schemas/practice.schema";
import { userAccountSchema, updateUsernameRequest, forgotPasswordRequest, changePasswordRequest, historyFilterRequest, deleteHistoryRequest, problemSubmissionSchema, historyResponse, deleteHistoryResponse, profileResponse } from "./schemas/user.schema";
import { ErrorResponse } from "./schemas/error.schema";
const app = express();
const port = 8000;
// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    const allowedOrigin = process.env.FRONTEND_ORIGIN ?? "*";
    res.header("Access-Control-Allow-Origin", allowedOrigin);
    res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-user-id");
    if (req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
    }
    next();
});
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'WADS-FP Calculator',
            version: '1.0.0',
        },
        components: {
            schemas: {
                // Ingestion
                ingestionImage: z.toJSONSchema(ingestionImage),
                ingestionText: z.toJSONSchema(ingestionText),
                ingestionResponse: z.toJSONSchema(ingestionResponse),
                // Solver
                solveRequest: z.toJSONSchema(solveRequest),
                solveResponse: z.toJSONSchema(solveResponse),
                // Explanation
                stepsRequest: z.toJSONSchema(stepsRequest),
                stepsResponse: z.toJSONSchema(stepsResponse),
                hintResponse: z.toJSONSchema(hintResponse),
                explanationRequest: z.toJSONSchema(explanationRequest),
                explanationResponse: z.toJSONSchema(explanationResponse),
                followUpRequest: z.toJSONSchema(followUpRequest),
                // Practice
                practiceRequest: z.toJSONSchema(practiceRequest),
                practiceResponse: z.toJSONSchema(practiceResponse),
                practiceRefresh: z.toJSONSchema(practiceRefresh),
                // User
                userAccountSchema: z.toJSONSchema(userAccountSchema),
                updateUsernameRequest: z.toJSONSchema(updateUsernameRequest),
                forgotPasswordRequest: z.toJSONSchema(forgotPasswordRequest),
                changePasswordRequest: z.toJSONSchema(changePasswordRequest),
                historyFilterRequest: z.toJSONSchema(historyFilterRequest),
                deleteHistoryRequest: z.toJSONSchema(deleteHistoryRequest),
                problemSubmissionSchema: z.toJSONSchema(problemSubmissionSchema),
                historyResponse: z.toJSONSchema(historyResponse),
                deleteHistoryResponse: z.toJSONSchema(deleteHistoryResponse),
                profileResponse: z.toJSONSchema(profileResponse),
                // Error
                ErrorResponse: z.toJSONSchema(ErrorResponse),
            }
        }
    },
    apis: ['./src/routes/*.ts', './src/index.ts'],
};
const openapiSpecification = swaggerJsdoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));
// Register API routes
app.use('/ingestion', ingestionRouter);
app.use('/solver', solverRouter);
app.use('/explanation', explanationRouter);
app.use('/practice', practiceRouter);
app.use('/user', userRouter);
app.get('/', (req, res) => {
    res.send('Welcome to Express & TypeScript Server');
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map