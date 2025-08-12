import { execSync } from "child_process";
const USER = execSync("git config --global user.name", { encoding: "utf-8" }).trim();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
    console.error("ERROR: Environment variable GITHUB_TOKEN is not set");
    process.exit(1);
}

export let fullData = [];

for (let page = 1; page < 10; page++) {
    console.log(`Downloading page ${page}`);

    const res = await fetch(
        `https://api.github.com/users/${USER}/events/public?page=${page}&per_page=101`,
        {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3+json",
            },
        }
    );

    if (!res.ok) {
        console.error(`Error downloading page ${page}: ${res.status} ${res.statusText}`);
        break;
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
        console.log("No more events, stopping.");
        break;
    }

    fullData.push(...data);

    await new Promise(r => setTimeout(r, 1000));
}

console.log("Downloading finished.");