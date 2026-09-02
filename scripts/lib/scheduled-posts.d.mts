export declare const BLOG_DIR: string;

export declare function publishCutoff(): string;

export declare function frontmatterField(raw: string, key: string): string | null;

export declare function isPublished(raw: string, cutoff: string): boolean;

export interface ScheduledPost {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  published: boolean;
}

export declare function readAllPosts(cutoff?: string): Promise<ScheduledPost[]>;

export declare function readPublishedPosts(cutoff?: string): Promise<ScheduledPost[]>;
