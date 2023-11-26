import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../server/index";
import { BACKEND_URL } from "./env";

// Pass AppRouter as generic here. 👇 This lets the `trpc` object know
// what procedures are available on the server and their input/output types.
export const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: BACKEND_URL,
        }),
    ],
});
