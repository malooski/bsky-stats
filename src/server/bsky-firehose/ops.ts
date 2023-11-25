import { Record as PostRecord } from "./generated/lexicons/types/app/bsky/feed/post";
import { Record as RepostRecord } from "./generated/lexicons/types/app/bsky/feed/repost";
import { Record as LikeRecord } from "./generated/lexicons/types/app/bsky/feed/like";
import { Record as FollowRecord } from "./generated/lexicons/types/app/bsky/graph/follow";

export enum RepoAction {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
}

export enum FirehoseId {
    POST = "app.bsky.feed.post",
    REPOST = "app.bsky.feed.repost",
    LIKE = "app.bsky.feed.like",
    FOLLOW = "app.bsky.graph.follow",
    BLOCK = "app.bsky.graph.block",
    UNBLOCK = "app.bsky.graph.unblock",
}

export interface PostCreateOp {
    cid: string;
    did: string;
    record: PostRecord;
}
