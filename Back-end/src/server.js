import express from "express";
import { prisma} from "./lib/prisma.ts"
import cors from "cors"

const app = express()
const PORT = 3001
app.use(cors());
app.use(express.json());