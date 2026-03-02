import { execSync } from "child_process";
const USER = execSync("git config --global user.name", { encoding: "utf-8" }).trim();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
    console.error("ERROR: Environment variable GITHUB_TOKEN is not set");
    process.exit(1);
}

export let fullData = [];
const pushEventsToFetch: any[] = [];
const repoCommits: Map<string, Map<string, any>> = new Map();
const prToFetch: Array<{ repo: string, number: number, key: string }> = [];
const prDetails: Map<string, any> = new Map(); // key: "repo/number" -> PR data

for (let page = 0; page < 4; page++) {
    console.log(`Downloading page ${page}`);

    const res = await fetch(
        `https://api.github.com/users/${USER}/events/public?page=${page}&per_page=100`,
        {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`
            },
        }
    );

    if (!res.ok) {
        console.error(`Error downloading page ${page}: ${res.status} ${res.statusText}`);
        console.error(await res.text());
        break;
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
        console.log("No more events, stopping.");
        break;
    }

    for (const event of data) {
        if (event.type === "PushEvent" && event.payload?.head) {
            const repoName = event.repo.name;
            const head = event.payload.head;

            if (!repoCommits.has(repoName)) {
                repoCommits.set(repoName, new Map());
            }
            if (!repoCommits.get(repoName)!.has(head)) {
                repoCommits.get(repoName)!.set(head, undefined);
                pushEventsToFetch.push({ repo: repoName, head });
            }
        }
        if (event.type === "PullRequestEvent" && event.payload?.number) {
            const repoName = event.repo.name;
            const prNumber = event.payload.number;
            const key = `${repoName}/${prNumber}`;

            if (!prDetails.has(key)) {
                prToFetch.push({ repo: repoName, number: prNumber, key });
            }
        }
        fullData.push(event);
    }

    await new Promise(r => setTimeout(r, 1000));
}

console.log(`Fetching commit details for ${pushEventsToFetch.length} unique commits across ${repoCommits.size} repos...`);

for (const repoName of repoCommits.keys()) {
    const commitsMap = repoCommits.get(repoName)!;
    const pendingCount = [...commitsMap.values()].filter(v => v === undefined).length;
    if (pendingCount === 0) continue;

    try {
        const commitsRes = await fetch(
            `https://api.github.com/repos/${repoName}/commits?per_page=100`,
            {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`
                },
            }
        );

        if (commitsRes.ok) {
            const commitsData = await commitsRes.json();
            for (const commit of commitsData) {
                const sha = commit.sha;
                if (commitsMap.has(sha)) {
                    commitsMap.set(sha, commit.commit);
                }
            }
        }
    } catch (e) {
        console.error(`Failed to fetch commits for ${repoName}`);
    }

    await new Promise(r => setTimeout(r, 500));
}

for (const event of fullData) {
    if (event.type === "PushEvent" && event.payload?.head) {
        const repoName = event.repo.name;
        const head = event.payload.head;
        const commitData = repoCommits.get(repoName)?.get(head);
        if (commitData) {
            event.payload.commits = [commitData];
        }
    }
}

if (prToFetch.length > 0) {
    console.log(`Fetching PR details for ${prToFetch.length} unique PRs...`);

    for (const { repo, number, key } of prToFetch) {
        try {
            const prRes = await fetch(
                `https://api.github.com/repos/${repo}/pulls/${number}`,
                {
                    headers: {
                        Authorization: `token ${GITHUB_TOKEN}`
                    },
                }
            );

            if (prRes.ok) {
                const prData = await prRes.json();
                prDetails.set(key, prData);
            }
        } catch (e) {
            console.error(`Failed to fetch PR ${repo}#${number}`);
        }
        await new Promise(r => setTimeout(r, 300));
    }

    for (const event of fullData) {
        if (event.type === "PullRequestEvent" && event.payload?.number) {
            const key = `${event.repo.name}/${event.payload.number}`;
            const prData = prDetails.get(key);
            if (prData?.title) {
                event.payload.pull_request = { number: prData.number, title: prData.title };
            }
        }
    }
}

console.log("Downloading finished.");
