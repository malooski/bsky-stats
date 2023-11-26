import React from "react";
import ReactDOM from "react-dom/client";
import { format } from "date-fns";

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { trpc } from "./trpc";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const queryClient = new QueryClient();

function App() {
    const statsQuery = useQuery({
        queryKey: ["globalStats"],
        queryFn: async () => trpc.getGlobalStats.query(),
        refetchInterval: 5000,
    });

    const data = statsQuery.data ?? [];

    return (
        <div>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart width={800} height={400} data={data}>
                    <Legend />
                    <XAxis
                        dataKey="ms"
                        tickFormatter={(v: number) => format(v, "h:mm:ss")}
                        allowDuplicatedCategory={false}
                    />
                    <Tooltip />
                    <YAxis />
                    <Line type="monotone" dataKey="eventsPerSecond" stroke="#8884d8" dot={false} />
                    <Line type="monotone" dataKey="postsPerSecond" stroke="#82ca9d" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>,
);
