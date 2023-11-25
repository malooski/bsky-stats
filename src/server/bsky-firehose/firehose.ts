import { Subscription } from "@atproto/xrpc-server";
import { cborToLexRecord, readCar } from "@atproto/repo";

import {
    Commit,
    RepoOp,
    isCommit,
} from "./generated/lexicons/types/com/atproto/sync/subscribeRepos";
import { delayMs } from "./utils";
import { ids, lexicons } from "./generated/lexicons/lexicons";
import { FirehoseEvent } from "./event";

const FEEDGEN_SUBSCRIPTION_ENDPOINT = "wss://bsky.network";
const DEFAULT_SUBSCRIPTION_RECONNECT_DELAY = 3000;

interface FirehoseArgs {
    service?: string;
    cursor?: number;
    reconnectDelayMs?: number;
}

export class Firehose {
    private _service: string;
    private _reconnectDelayMs: number;
    private _stop: boolean = false;

    private _sub: Subscription<Commit>;

    private _cursor: number | undefined;

    handleEvent?(event: FirehoseEvent): void;

    constructor(args?: FirehoseArgs) {
        this._service = args?.service ?? FEEDGEN_SUBSCRIPTION_ENDPOINT;
        this._reconnectDelayMs = args?.reconnectDelayMs ?? DEFAULT_SUBSCRIPTION_RECONNECT_DELAY;
        this._cursor = args?.cursor;

        this._sub = new Subscription({
            service: this._service,
            method: ids.ComAtprotoSyncSubscribeRepos,
            getParams: () => this.getCursor(),
            validate: (value: unknown) => {
                try {
                    return lexicons.assertValidXrpcMessage<RepoOp>(
                        ids.ComAtprotoSyncSubscribeRepos,
                        value,
                    );
                } catch (err) {
                    console.error("repo subscription skipped invalid message", err);
                }
            },
        });
    }

    async run() {
        this._stop = false;
        while (!this._stop) {
            try {
                for await (const evt of this._sub) {
                    if (this._stop) break;

                    try {
                        if (!isCommit(evt)) continue;
                        if (evt.seq % 20 === 0) {
                            this.updateCursor(evt.seq);
                        }

                        const car = await readCar(evt.blocks);

                        for (const op of evt.ops) {
                            const authorDid = evt.repo;

                            if (op.cid == null) {
                                this.handleEvent?.({ evt, op });
                                continue;
                            }
                            const recordBytes = car.blocks.get(op.cid);

                            if (recordBytes == null) {
                                this.handleEvent?.({ evt, op });

                                continue;
                            }

                            const record = cborToLexRecord(recordBytes);

                            this.handleEvent?.({ evt, op, record });
                        }
                    } catch (err) {
                        console.error("repo subscription could not handle message", err);
                    }
                }
            } catch (err) {
                console.error("repo subscription failed", err);
                await delayMs(this._reconnectDelayMs);
            }
        }
    }

    stop() {
        this._stop = true;
    }

    async updateCursor(cursor: number) {
        this._cursor = cursor;
    }

    async getCursor(): Promise<{ cursor?: number }> {
        if (this._cursor == null) {
            return {};
        }

        return { cursor: this._cursor };
    }
}
