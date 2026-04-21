import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const m = fs.readFileSync(
  path.join(root, "components", "theme-switch-markup.html"),
  "utf8"
);
const wrapped =
  "      <span class=\"theme-switch-wrap\">\n" +
  m
    .split(/\r?\n/)
    .map((line) => (line.trim() ? "        " + line : line))
    .join("\n") +
  "\n      </span>";

const p = path.join(root, "design-test.html");
let t = fs.readFileSync(p, "utf8");
const re =
  /<button\s[^>]*class="theme-toggle"[^>]*>[\s\S]*?<\/button>/g;
const matches = t.match(re);
if (!matches || matches.length !== 1) {
  console.error("design-test BAD", matches?.length);
  process.exit(1);
}
t = t.replace(re, wrapped);
fs.writeFileSync(p, t, "utf8");
console.log("OK design-test");
