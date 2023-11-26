import {config} from "dotenv";
import {expand} from "dotenv-expand";

const myEnv = config();
expand(myEnv);

export const IS_DEV_MODE = process.env.NODE_ENV === "development";
export const DATABASE_URL = expectEnvVar("DATABASE_URL");
export const PORT = expectParseInt(process.env.BACKEND_PORT ?? 3000);


export function expectEnvVar(name: string): string {
    const value = process.env[name];
    if (value === undefined) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}

function expectParseInt(value: string | number): number | undefined {
    if(typeof value === "number") {
        return Math.floor(value);
    }

    const parsed = parseInt(value, 10);
    if(isNaN(parsed)) {
        throw new Error(`Invalid integer: ${value}`);
    }

    return parsed;
}