import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const socialBlock = `        <ul class="social-row footer-social" role="list">
          <li>
            <a
              href="mailto:info@novodesign.ch"
              class="social-chip social-chip--mail"
              aria-label="Écrire à info@novodesign.ch"
            >
              <span class="social-chip__tooltip">info@novodesign.ch</span>
              <img src="assets/mail.svg" alt="" width="22" height="22" />
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/designed.by.novo"
              class="social-chip social-chip--instagram"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="@designed.by.novo sur Instagram"
            >
              <span class="social-chip__tooltip">@designed.by.novo</span>
              <img
                src="assets/instagram-icon.svg"
                alt=""
                width="24"
                height="24"
              />
            </a>
          </li>
        </ul>`;

const footerRe =
  /<div class="footer-links">[\s\S]*?<\/div>(?=\s*<\/div>\s*<div class="section__inner footer-bottom">)/g;

for (const name of [
  "index.html",
  "services.html",
  "realisations.html",
  "a-propos.html",
  "contact.html",
]) {
  const p = path.join(root, name);
  let t = fs.readFileSync(p, "utf8");
  const n = (t.match(footerRe) || []).length;
  if (n !== 1) {
    console.error("footer BAD", name, n);
    process.exitCode = 1;
    continue;
  }
  t = t.replace(footerRe, socialBlock);
  fs.writeFileSync(p, t, "utf8");
  console.log("footer OK", name);
}
