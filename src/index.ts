import { writeFileSync } from "fs";
import { fullData } from "./get";
import { formatEvents } from "./format";

const events = formatEvents(fullData);
writeFileSync("results.csv", events.map(e => e.join(", ")).join("\n"));