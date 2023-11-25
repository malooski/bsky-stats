import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";


export const settings = sqliteTable("settings", {
    id: integer("id").primaryKey(),
    key: text("key").unique(),
    iValue: integer("iValue").default(0),
    sValue: text("sValue").default(""),
});

export const profile = sqliteTable("profile", {
    id: integer("id").primaryKey(),
    did: text("did").unique(),
});

export const globalStats = sqliteTable("globalStats", {
    id: integer("id").primaryKey(),
    ms: integer("ms").unique(),

    postsPerSecond: integer("postsPerSecond").default(0),
    newUsersPerSecond: integer("newUsersPerSecond").default(0),
    likesPerSecond: integer("likesPerSecond").default(0),


});
