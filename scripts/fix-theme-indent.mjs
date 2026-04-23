import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const re =
  />\s*\n\s{20,}<span class="theme-switch-wrap">\s*\n\s+<label class="switch theme-switch"/;

const rep = `>
          <span class="theme-switch-wrap">
            <label class="switch theme-switch"`;

for (const name of [
  "services.html",
  "realisations.html",
  "a-propos.html",
  "contact.html",
]) {
  const p = path.join(root, name);
  let t = fs.readFileSync(p, "utf8");
  if (!re.test(t)) {
    console.log("no match", name);
    continue;
  }
  t = t.replace(re, rep);
  fs.writeFileSync(p, t, "utf8");
  console.log("fixed", name);
}
