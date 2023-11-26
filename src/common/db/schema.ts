import { serial, integer, pgTable, varchar, bigint, doublePrecision } from "drizzle-orm/pg-core";


export const settings = pgTable("settings", {
    id: serial("id").primaryKey(),
    key: varchar("key", {length: 32}).unique().notNull(),
    iValue: integer("iValue").default(0),
    sValue: varchar("sValue").default(""),
});

export const profile = pgTable("profile", {
    id: serial("id").primaryKey(),
    did: varchar("did", {length: 64}).unique().notNull(),
});

export const globalStats = pgTable("globalStats", {
    id: serial("id").primaryKey(),
    ms: bigint("ms", {mode: "number"}).unique().notNull(),

    postsPerSecond: doublePrecision("postsPerSecond").default(0).notNull(),
});
