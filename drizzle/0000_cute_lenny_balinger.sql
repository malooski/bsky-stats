CREATE TABLE IF NOT EXISTS "globalStats" (
	"id" serial PRIMARY KEY NOT NULL,
	"ms" integer,
	"postsPerSecond" integer DEFAULT 0,
	"newUsersPerSecond" integer DEFAULT 0,
	"likesPerSecond" integer DEFAULT 0,
	CONSTRAINT "globalStats_ms_unique" UNIQUE("ms")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"did" varchar(64),
	CONSTRAINT "profile_did_unique" UNIQUE("did")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(32),
	"iValue" integer DEFAULT 0,
	"sValue" varchar DEFAULT '',
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
