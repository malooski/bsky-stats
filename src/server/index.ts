import { z } from "zod";
import { publicProcedure, router } from "./trpc";
import { createHTTPHandler, createHTTPServer } from "@trpc/server/adapters/standalone";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "../../db/schema";
import { Firehose } from "./bsky-firehose/firehose";
import { isCreate, isPost } from "./bsky-firehose/event";
import cors from "cors";
import http from "http";

const firehose = new Firehose();

const GlobalStatSchema = z.object({
    id: z.number(),
    ms: z.number(),
    postsPerSecond: z.number(),
    newUsersPerSecond: z.number(),
    likesPerSecond: z.number(),
});

interface GlobalStat {
    ms: number;
    postsPerSecond: number;
    eventsPerSecond: number;
}

let eventCount = 0;
let postCount = 0;
const intervalMs = 1000;
let lastMs = Date.now();

const statHistory: GlobalStat[] = [];

firehose.handleEvent = async event => {
    eventCount++;

    if (!isCreate(event)) return;

    if (isPost(event.record)) {
        postCount++;
    }
};

setInterval(() => {
    const nowMs = Date.now();
    const diffMs = nowMs - lastMs;
    const postsPerSecond = (postCount / diffMs) * 1000;
    const eventsPerSecond = (eventCount / diffMs) * 1000;

    console.log(`postsPerSecond: ${postsPerSecond}`);

    statHistory.push({
        ms: nowMs,
        postsPerSecond,
        eventsPerSecond,
    });

    postCount = 0;
    eventCount = 0;
    lastMs = nowMs;
}, intervalMs);

const appRouter = router({
    getGlobalStats: publicProcedure.query(async () => {
        return statHistory;
    }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

const server = createHTTPServer({
    router: appRouter,
    middleware: cors(),
});

const listening = server.listen(3000);
console.log(`Listening on port ${listening.port}`);

firehose.run();
