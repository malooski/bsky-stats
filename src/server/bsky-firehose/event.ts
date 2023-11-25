import { RepoRecord } from "@atproto/lexicon";

import { Record as PostRecord } from "./generated/lexicons/types/app/bsky/feed/post";
import { Record as RepostRecord } from "./generated/lexicons/types/app/bsky/feed/repost";
import { Record as LikeRecord } from "./generated/lexicons/types/app/bsky/feed/like";
import { Record as FollowRecord } from "./generated/lexicons/types/app/bsky/graph/follow";

import { Commit, RepoOp } from "./generated/lexicons/types/com/atproto/sync/subscribeRepos";
import { ids, lexicons } from "./generated/lexicons/lexicons";
import { BlobRef } from "@atproto/api";
import { get } from "lodash";

export interface FirehoseEvent {
    evt: Commit;
    op: RepoOp;
    record?: RepoRecord;
}

export function getAuthorDid(event: FirehoseEvent): string {
    return event.evt.repo;
}

export function getUri(event: FirehoseEvent): string {
    return `at://${event.evt.repo}/${event.op.path}`;
}

export const isPost = (obj: RepoRecord | null | undefined): obj is PostRecord => {
    return isType(obj, ids.AppBskyFeedPost);
};

export const isRepost = (obj: RepoRecord | null | undefined): obj is RepostRecord => {
    return isType(obj, ids.AppBskyFeedRepost);
};

export const isLike = (obj: RepoRecord | null | undefined): obj is LikeRecord => {
    return isType(obj, ids.AppBskyFeedLike);
};

export const isFollow = (obj: RepoRecord | null | undefined): obj is FollowRecord => {
    return isType(obj, ids.AppBskyGraphFollow);
};

export function isCreate(event: FirehoseEvent): boolean {
    return event.op.action === "create";
}

function isType(obj: RepoRecord | null | undefined, nsid: string) {
    if (!obj) return false;
    if ((obj as any).$type !== nsid) return false;
    try {
        lexicons.assertValidRecord(nsid, fixBlobRefs(obj));
        return true;
    } catch (err) {
        return false;
    }
}

// @TODO right now record validation fails on BlobRefs
// simply because multiple packages have their own copy
// of the BlobRef class, causing instanceof checks to fail.
// This is a temporary solution.
function fixBlobRefs(obj: unknown): unknown {
    if (Array.isArray(obj)) {
        return obj.map(fixBlobRefs);
    }
    if (obj && typeof obj === "object") {
        if (obj.constructor.name === "BlobRef") {
            const blob = obj as BlobRef;
            return new BlobRef(blob.ref, blob.mimeType, blob.size, blob.original);
        }
        return Object.entries(obj).reduce((acc, [key, val]) => {
            return Object.assign(acc, { [key]: fixBlobRefs(val) });
        }, {} as Record<string, unknown>);
    }
    return obj;
}
