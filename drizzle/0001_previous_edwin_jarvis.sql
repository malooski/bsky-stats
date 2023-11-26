ALTER TABLE "globalStats" ALTER COLUMN "postsPerSecond" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ALTER COLUMN "did" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ALTER COLUMN "key" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "globalStats" DROP COLUMN IF EXISTS "newUsersPerSecond";--> statement-breakpoint
ALTER TABLE "globalStats" DROP COLUMN IF EXISTS "likesPerSecond";