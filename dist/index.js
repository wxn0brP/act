import { writeFileSync } from "fs";
import { fullData } from "./get.js";
import { formatEvents } from "./format.js";
const events = formatEvents(fullData);
writeFileSync("results.csv", events.map(e => e.join(", ")).join("\n"));
