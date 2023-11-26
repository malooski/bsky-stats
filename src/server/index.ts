import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { desc, gt } from "drizzle-orm";
import fastify from "fastify";
import { z } from "zod";
import { setAsyncInterval } from "../common/async";
import { globalStats } from "../common/db/schema";
import { isCreate, isPost } from "./bsky-firehose/event";
import { Firehose } from "./bsky-firehose/firehose";
import { db } from "./db/connection";
import { migrateDatabase } from "./db/migrate";
import { PORT } from "./env";
import { getLoggerConfig } from "./logger";
import { publicProcedure, router } from "./trpc";

const firehose = new Firehose();


interface GlobalStat {
    ms: number;
    postsPerSecond: number;
    eventsPerSecond: number;
}

let eventCount = 0;
let postCount = 0;
const intervalMs = 1000 * 30;
let lastMs = Date.now();

const statHistory: GlobalStat[] = [];

firehose.handleEvent = async event => {
    eventCount++;

    if (!isCreate(event)) return;

    if (isPost(event.record)) {
        postCount++;
    }
};

let globalStatsHistory: GlobalStat[] = [];


const appRouter = router({
    getGlobalStats: publicProcedure.query(async () => {
        return globalStatsHistory;
    }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

async function main() {
    await migrateDatabase();

    const server = fastify({
        maxParamLength: 5000,
        logger: getLoggerConfig(),
    });

    await server.register(cors);

    server.register(fastifyTRPCPlugin, {
        prefix: "/trpc",
        trpcOptions: { router: appRouter },
    });

    try {
        await server.listen({ port: PORT, host: "0.0.0.0" });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }

    setAsyncInterval({ func: async () => {
        const nowMs = Date.now();
        const diffMs = nowMs - lastMs;
        const postsPerSecond = (postCount / diffMs) * 1000;
        const eventsPerSecond = (eventCount / diffMs) * 1000;

        server.log.info(`postsPerSecond: ${postsPerSecond}`);

        statHistory.push({
            ms: nowMs,
            postsPerSecond,
            eventsPerSecond,
        });

        await db.insert(globalStats).values({
            ms: nowMs,
            postsPerSecond: postsPerSecond,  
        }).catch(err => {
            console.error(err);
        
        });

    
        const oneDayAgoMs = nowMs - (1000 * 60 * 60 * 24);
        const stats = await db.select().from(globalStats).where(gt(globalStats.ms, oneDayAgoMs)).orderBy(desc(globalStats.ms));
        
        console.log("Stats", stats.length);
    
        globalStatsHistory = stats.map(stat => ({
            ms: stat.ms,
            postsPerSecond: stat.postsPerSecond,
            eventsPerSecond: stat.postsPerSecond,
        }));
    
        console.log("Global Stats History", globalStatsHistory.length);

        postCount = 0;
        eventCount = 0;
        lastMs = nowMs;
 }, intervalMs, runImmediately: true});

    firehose.run();
}

main();

process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    firehose.stop();
    process.exit(0);
});