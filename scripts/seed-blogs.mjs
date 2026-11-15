import { createBlogPost, getBlogs } from "../lib/blog-store.ts";

const SAMPLE_POSTS = [
  {
    title: "Cloud Computing Notes",
    content:
      "First semester notes on cloud architecture and deployment models.\n\nCovered IaaS, PaaS, and SaaS trade-offs, shared-responsibility security, and how autoscaling changes the way applications are designed.",
  },
  {
    title: "Last-Mile Delivery Reflections",
    content:
      "What the C103 optimization project taught me about cost, emissions, and reliability trade-offs.\n\nEvery network decision moves at least one of the three. The interesting work is making the trade-offs explicit instead of optimizing one dimension in isolation.",
  },
];

const blogs = await getBlogs();
const existingTitles = new Set(blogs.map((post) => post.title));

for (const sample of SAMPLE_POSTS) {
  if (existingTitles.has(sample.title)) {
    console.log(`skipped (already exists): "${sample.title}"`);
    continue;
  }
  const created = await createBlogPost(sample);
  console.log(`created: "${created.title}" → /${created.slug}`);
}

console.log(`\nTotal posts in data/blogs.json: ${(await getBlogs()).length}`);
