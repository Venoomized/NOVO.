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
  "          <span class=\"theme-switch-wrap\">\n" +
  m
    .split(/\r?\n/)
    .map((line) => (line.trim() ? "            " + line : line))
    .join("\n") +
  "\n          </span>";

const re =
  /<button\s[^>]*class="theme-toggle"[^>]*>[\s\S]*?<\/button>/g;

for (const name of [
  "index.html",
  "services.html",
  "realisations.html",
  "a-propos.html",
  "contact.html",
]) {
  const p = path.join(root, name);
  let t = fs.readFileSync(p, "utf8");
  const matches = t.match(re);
  if (!matches || matches.length !== 1) {
    console.error("BAD", name, matches?.length);
    process.exitCode = 1;
    continue;
  }
  t = t.replace(re, wrapped);
  fs.writeFileSync(p, t, "utf8");
  console.log("OK", name);
}
