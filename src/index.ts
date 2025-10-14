#!/usr/bin/env bun

import { existsSync, readFileSync, writeFileSync } from "fs";
import { formatEvents } from "./format";

let fullData = [];
if (existsSync("fullData.json")) {
    fullData = JSON.parse(readFileSync("fullData.json", "utf-8"));
} else {
    fullData = await import("./get").then(m => m.fullData);
    writeFileSync("fullData.json", JSON.stringify(fullData, null, 2));
}

console.log(`Found ${fullData.length} events`);
const events = formatEvents(fullData);
writeFileSync("results.csv", events.map(e => e.join(", ")).join("\n"));