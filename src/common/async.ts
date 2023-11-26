interface SetAsyncIntervalOptions {
    func: () => Promise<void>;
    intervalMs: number;
    runImmediately?: boolean;
}

export function setAsyncInterval(options: SetAsyncIntervalOptions): () => void {
    let timeout: number;

    const run = async () => {
        await options.func();
        timeout = setTimeout(run, options.intervalMs) as any as number;
    };

    if (options.runImmediately) {
        run();
    } else {
        timeout = setTimeout(run, options.intervalMs) as any as number;
    }
    return () => clearTimeout(timeout);
}
