import cors from "cors";
import express, { Request, Response } from "express";
import helmet from "helmet";
import analyzeRouter from "./routes/analyze";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", analyzeRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});