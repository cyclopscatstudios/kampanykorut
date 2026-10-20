import { z } from "zod";
import type { GithubClient } from "../../integrations/github/github-client";
import { GithubError } from "../../integrations/github/github-client";

export const NEWS_SYNC_PAGE_SIZE = 20;
const FULL_SYNC_PAGE_SIZE = 50;
const FULL_SYNC_MAX_PAGES = 40;

const PINNED_FIELDS = /* GraphQL */ `
      pinnedDiscussions(first: 10) {
        nodes {
          discussion {
            id
          }
        }
      }
`;

const DISCUSSION_FIELDS = /* GraphQL */ `
  fragment NewsDiscussion on Discussion {
    id
    number
    title
    body
    url
    createdAt
    updatedAt
    closed
    upvoteCount
    category {
      id
    }
    comments {
      totalCount
    }
    labels(first: 20) {
      nodes {
        name
      }
    }
  }
`;

export const NEWS_CATEGORIES_QUERY = /* GraphQL */ `
  query NewsCategories($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      discussionCategories(first: 25) {
        nodes {
          id
          name
          slug
        }
      }
    }
  }
`;

export const NEWS_DISCUSSIONS_QUERY = /* GraphQL */ `
  query NewsDiscussions(
    $owner: String!
    $name: String!
    $categoryId: ID!
    $first: Int!
    $after: String
  ) {
    repository(owner: $owner, name: $name) {
      ${PINNED_FIELDS}
      discussions(
        categoryId: $categoryId
        first: $first
        after: $after
        orderBy: { field: CREATED_AT, direction: DESC }
      ) {
        nodes {
          ...NewsDiscussion
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
  ${DISCUSSION_FIELDS}
`;

export const NEWS_DISCUSSION_QUERY = /* GraphQL */ `
  query NewsDiscussion($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) {
      ${PINNED_FIELDS}
      discussion(number: $number) {
        ...NewsDiscussion
      }
    }
  }
  ${DISCUSSION_FIELDS}
`;

const DiscussionSchema = z
  .object({
    id: z.string(),
    number: z.number().int(),
    title: z.string(),
    body: z.string(),
    url: z.url(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    closed: z.boolean(),
    upvoteCount: z.number().int(),
    category: z.object({ id: z.string() }),
    comments: z.object({ totalCount: z.number().int() }),
    labels: z
      .object({ nodes: z.array(z.object({ name: z.string() }).nullable()) })
      .nullable(),
  })
  .transform((d) => ({
    githubId: d.id,
    number: d.number,
    title: d.title,
    markdown: d.body,
    url: d.url,
    createdAt: new Date(d.createdAt),
    updatedAt: new Date(d.updatedAt),
    closed: d.closed,
    upvoteCount: d.upvoteCount,
    commentCount: d.comments.totalCount,
    categoryId: d.category.id,
    labels: (d.labels?.nodes ?? []).flatMap((label) =>
      label ? [label.name] : [],
    ),
  }));

export type NewsDiscussion = z.output<typeof DiscussionSchema> & {
  isPinned: boolean;
};

const PinnedSchema = z
  .object({
    nodes: z.array(
      z.object({ discussion: z.object({ id: z.string() }) }).nullable(),
    ),
  })
  .transform(
    (pinned) =>
      new Set(pinned.nodes.flatMap((n) => (n ? [n.discussion.id] : []))),
  );

const CategoriesResponse = z.object({
  repository: z
    .object({
      discussionCategories: z.object({
        nodes: z.array(
          z.object({ id: z.string(), name: z.string(), slug: z.string() }),
        ),
      }),
    })
    .nullable(),
});

const DiscussionsResponse = z.object({
  repository: z
    .object({
      pinnedDiscussions: PinnedSchema,
      discussions: z.object({
        nodes: z.array(DiscussionSchema),
        pageInfo: z.object({
          hasNextPage: z.boolean(),
          endCursor: z.string().nullable(),
        }),
      }),
    })
    .nullable(),
});

const DiscussionResponse = z.object({
  repository: z
    .object({
      pinnedDiscussions: PinnedSchema,
      discussion: DiscussionSchema.nullable(),
    })
    .nullable(),
});

function parse<T extends z.ZodType>(schema: T, data: unknown): z.output<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new GithubError(
      `Unexpected GitHub response shape:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

export class NewsGithubSource {
  private categoryId: Promise<string> | null = null;

  constructor(
    private readonly client: GithubClient,
    private readonly category: string,
  ) {}

  resolveCategoryId(): Promise<string> {
    this.categoryId ??= this.fetchCategoryId().catch((err: unknown) => {
      this.categoryId = null;
      throw err;
    });
    return this.categoryId;
  }

  async fetchLatest(
    first: number = NEWS_SYNC_PAGE_SIZE,
  ): Promise<NewsDiscussion[]> {
    const page = await this.fetchPage(first, null);
    return page.nodes;
  }

  async fetchAll(): Promise<NewsDiscussion[]> {
    const all: NewsDiscussion[] = [];
    let after: string | null = null;

    for (let i = 0; i < FULL_SYNC_MAX_PAGES; i++) {
      const page = await this.fetchPage(FULL_SYNC_PAGE_SIZE, after);
      all.push(...page.nodes);
      if (!page.pageInfo.hasNextPage || !page.pageInfo.endCursor) return all;
      after = page.pageInfo.endCursor;
    }

    throw new GithubError(
      `News category has more than ${FULL_SYNC_MAX_PAGES} pages of discussions`,
    );
  }

  async fetchByNumber(number: number): Promise<NewsDiscussion | null> {
    const data = await this.client
      .graphql(NEWS_DISCUSSION_QUERY, { ...this.client.repo, number })
      .catch((err: unknown) => {
        if (err instanceof GithubError && err.isNotFound) return null;
        throw err;
      });
    if (data === null) return null;

    const { repository } = parse(DiscussionResponse, data);

    if (!repository) throw this.repoNotFound();
    const { discussion, pinnedDiscussions } = repository;
    return discussion
      ? { ...discussion, isPinned: pinnedDiscussions.has(discussion.githubId) }
      : null;
  }

  async isNews(discussion: NewsDiscussion): Promise<boolean> {
    return discussion.categoryId === (await this.resolveCategoryId());
  }

  private async fetchPage(first: number, after: string | null) {
    const data = await this.client.graphql(NEWS_DISCUSSIONS_QUERY, {
      ...this.client.repo,
      categoryId: await this.resolveCategoryId(),
      first,
      after,
    });
    const { repository } = parse(DiscussionsResponse, data);

    if (!repository) throw this.repoNotFound();
    const { discussions, pinnedDiscussions } = repository;
    return {
      pageInfo: discussions.pageInfo,
      nodes: discussions.nodes.map((d) => ({
        ...d,
        isPinned: pinnedDiscussions.has(d.githubId),
      })),
    };
  }

  private async fetchCategoryId(): Promise<string> {
    const data = await this.client.graphql(
      NEWS_CATEGORIES_QUERY,
      this.client.repo,
    );
    const { repository } = parse(CategoriesResponse, data);

    if (!repository) throw this.repoNotFound();

    const wanted = this.category.toLocaleLowerCase("hu");
    const match = repository.discussionCategories.nodes.find(
      (c) => c.name.toLocaleLowerCase("hu") === wanted || c.slug === wanted,
    );

    if (!match) {
      throw new GithubError(
        `Discussion category "${this.category}" not found in ` +
          `${this.client.repo.owner}/${this.client.repo.name}`,
      );
    }

    return match.id;
  }

  private repoNotFound() {
    const { owner, name } = this.client.repo;
    return new GithubError(
      `Repository ${owner}/${name} not found or not accessible to the GitHub App`,
    );
  }
}
