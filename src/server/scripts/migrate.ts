import { migrateDatabase } from "../db/migrate";

async function main() {
    await migrateDatabase()
}

main()
.then(() => {
    console.log("Migration complete");
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);  
});