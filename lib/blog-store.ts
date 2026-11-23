import { promises as fs } from "fs";
import path from "path";

export type BlogPost = {
  slug: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
};

export type BlogPostInput = {
  title: string;
  content: string;
};

function dataDir(): string {
  return process.env.BLOGS_DATA_DIR ?? path.join(process.cwd(), "data");
}

function dataFile(): string {
  return path.join(dataDir(), "blogs.json");
}

function isValidPost(value: unknown): value is BlogPost {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const post = value as Record<string, unknown>;
  return (
    typeof post.slug === "string" &&
    post.slug.length > 0 &&
    typeof post.title === "string" &&
    post.title.length > 0 &&
    typeof post.content === "string" &&
    post.content.length > 0 &&
    typeof post.createdAt === "string" &&
    !Number.isNaN(Date.parse(post.createdAt))
  );
}

async function readBlogs(): Promise<BlogPost[]> {
  let raw: string;
  try {
    raw = await fs.readFile(dataFile(), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw new Error(`Blog storage is unreadable: ${String(error)}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Blog storage contains malformed JSON.");
  }

  if (!Array.isArray(parsed) || !parsed.every(isValidPost)) {
    throw new Error("Blog storage contains invalid entries.");
  }

  const slugs = parsed.map((post) => post.slug);
  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Blog storage contains duplicate slugs.");
  }

  return parsed;
}

function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "post";
}

let writeQueue: Promise<unknown> = Promise.resolve();

function queued<T>(operation: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(operation);
  writeQueue = run.catch(() => {});
  return run;
}

async function writeBlogs(blogs: BlogPost[]): Promise<void> {
  const dir = dataDir();
  await fs.mkdir(dir, { recursive: true });
  const tempFile = path.join(
    dir,
    `.blogs-${process.pid}-${crypto.randomUUID()}.tmp`,
  );

  try {
    await fs.writeFile(
      tempFile,
      JSON.stringify(blogs, null, 2),
      "utf8",
    );
    await fs.rename(tempFile, dataFile());
  } catch (error) {
    await fs.rm(tempFile, { force: true });
    throw error;
  }
}

export async function getBlogs(): Promise<BlogPost[]> {
  return readBlogs();
}

export async function createBlogPost(input: BlogPostInput): Promise<BlogPost> {
  return queued(async () => {
    const blogs = await readBlogs();

    const takenSlugs = new Set(blogs.map((post) => post.slug));
    const base = slugify(input.title);
    let slug = base;
    for (let n = 2; takenSlugs.has(slug); n += 1) {
      slug = `${base}-${n}`;
    }

    const post: BlogPost = {
      slug,
      title: input.title,
      content: input.content,
      createdAt: new Date().toISOString(),
    };

    await writeBlogs([post, ...blogs]);

    return post;
  });
}

export async function updateBlogPost(
  slug: string,
  patch: Partial<BlogPostInput>,
): Promise<BlogPost | null> {
  return queued(async () => {
    const blogs = await readBlogs();
    const index = blogs.findIndex((post) => post.slug === slug);
    if (index === -1) {
      return null;
    }
    const updated: BlogPost = {
      ...blogs[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    blogs[index] = updated;
    await writeBlogs(blogs);
    return updated;
  });
}

export async function deleteBlogPost(slug: string): Promise<boolean> {
  return queued(async () => {
    const blogs = await readBlogs();
    const remaining = blogs.filter((post) => post.slug !== slug);
    if (remaining.length === blogs.length) {
      return false;
    }
    await writeBlogs(remaining);
    return true;
  });
}
