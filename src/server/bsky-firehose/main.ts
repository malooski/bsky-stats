import { isCreate, isPost } from "./event";
import { Firehose } from "./firehose";

async function main() {
    const firehose = new Firehose();

    firehose.handleEvent = async event => {
        if (isCreate(event) && isPost(event.record)) {
            console.log("Post", event.record.text);
        }
    };

    firehose.run();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
