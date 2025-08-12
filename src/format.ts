export interface GhEvent {
    created_at: string;
    type: string;
    repo: { name: string };
    payload: any;
}

export function formatEvents(events: GhEvent[]): string[][] {
    return events
        .map(e => {
            let detail: string | null = null;

            switch (e.type) {
                case "PushEvent":
                    if (Array.isArray(e.payload?.commits)) {
                        detail = e.payload.commits.map((c: any) => c.message).join(" | ");
                    }
                    break;

                case "PullRequestEvent":
                    if (e.payload?.pull_request) {
                        const pr = e.payload.pull_request;
                        detail = `PR #${pr.number}: ${pr.title}`;
                    }
                    break;

                case "IssuesEvent":
                    if (e.payload?.issue) {
                        const issue = e.payload.issue;
                        detail = `Issue #${issue.number}: ${issue.title}`;
                    }
                    break;

                case "IssueCommentEvent":
                    if (e.payload?.comment?.body) {
                        const body = e.payload.comment.body.replace(/[\r\n]+/g, " ").slice(0, 80);
                        detail = `Comment: ${body}`;
                    }
                    break;

                case "PullRequestReviewCommentEvent":
                    if (e.payload?.comment?.body) {
                        const body = e.payload.comment.body.replace(/[\r\n]+/g, " ").slice(0, 80);
                        detail = `Review comment: ${body}`;
                    }
                    break;

                default:
                    detail = null;
            }

            if (detail === null) return null;

            return [e.created_at, e.type, e.repo.name, detail];
        })
        .filter((row): row is string[] => row !== null);
}
