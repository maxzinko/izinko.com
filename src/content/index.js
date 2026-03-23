// Auto-discovers all .md files in projects/ and things/ folders.
// To add a new post: just create a new .md file in the right folder.

function parseFrontmatter(rawInput) {
  const raw = rawInput.replace(/\r\n/g, "\n");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    // strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    meta[key] = val;
  }

  // body = paragraphs split by blank lines
  const body = match[2]
    .trim()
    .split(/\n\n+/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);

  return { meta, body };
}

function parseLink(linkStr) {
  if (!linkStr) return undefined;
  const [label, url] = linkStr.split("|").map((s) => s.trim());
  return { label, url };
}

// Vite glob import — eagerly loads all .md files as raw strings
const projectFiles = import.meta.glob("./projects/*.md", { eager: true, query: "?raw", import: "default" });
const thingFiles = import.meta.glob("./things/*.md", { eager: true, query: "?raw", import: "default" });

// Parse freeform date strings into sortable timestamps (newest first)
function parseDate(str) {
  if (!str) return 0;
  // handles: "2025", "march 2026", "2026/03", "april 2026", etc.
  const d = new Date(str.replace(/\//g, "-"));
  return isNaN(d) ? 0 : d.getTime();
}

function sortNewestFirst(posts) {
  return [...posts].sort((a, b) => parseDate(b.date) - parseDate(a.date));
}

function loadPosts(files, section) {
  return Object.entries(files).map(([path, raw]) => {
    const slug = path.split("/").pop().replace(/\.md$/, "");
    const { meta, body } = parseFrontmatter(raw);
    return {
      title: meta.title || slug,
      slug,
      date: meta.date || "",
      section,
      image: meta.image || null,
      link: parseLink(meta.link),
      body,
    };
  });
}

const projects = sortNewestFirst(loadPosts(projectFiles, "projects"));
const things = sortNewestFirst(loadPosts(thingFiles, "things"));
const allPosts = [...projects, ...things];

export const POSTS = Object.fromEntries(allPosts.map((p) => [p.slug, p]));

export const PROJECTS = projects.map(({ title, slug, date, image }) => ({ title, slug, date, image }));

export const THINGS = things.map(({ title, slug, date, image }) => ({ title, slug, date, image }));
