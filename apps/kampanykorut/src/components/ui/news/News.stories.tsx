import type { Story } from "@ladle/react";
import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import type { NewsType } from "@/shared/types";
import { sampleNews, sampleNewsDetail } from "./news.fixtures";
import { NewsArchiveView } from "./NewsArchivePage";
import { NewsBellView } from "./NewsBell";
import { NewsDetailView } from "./NewsDetailPage";
import { NewsSectionView } from "./NewsSection";

const Page = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <div className="min-h-screen bg-[#0f172a] py-6 text-slate-100">
      {children}
    </div>
  </MemoryRouter>
);

export const LandingSection: Story = () => (
  <Page>
    <NewsSectionView state={{ status: "ready", items: sampleNews }} lang="hu" />
  </Page>
);

export const LandingSectionSingle: Story = () => (
  <Page>
    <NewsSectionView
      state={{ status: "ready", items: sampleNews.slice(0, 1) }}
      lang="hu"
    />
  </Page>
);

export const LandingSectionLoading: Story = () => (
  <Page>
    <NewsSectionView state={{ status: "loading" }} lang="hu" />
  </Page>
);

export const Archive: Story = () => {
  const [type, setType] = useState<NewsType | undefined>();
  return (
    <Page>
      <div className="mx-auto max-w-5xl px-6">
        <NewsArchiveView
          archive={{
            status: "ready",
            items: sampleNews.filter((n) => !type || n.type === type),
            hasMore: true,
            loadingMore: false,
            loadMore: () => {},
          }}
          lang="hu"
          type={type}
          onSelectType={setType}
        />
      </div>
    </Page>
  );
};

export const Detail: Story = () => (
  <Page>
    <div className="px-6">
      <NewsDetailView
        state={{ status: "ready", news: sampleNewsDetail }}
        lang="hu"
      />
    </div>
  </Page>
);

export const DetailNotFound: Story = () => (
  <Page>
    <div className="px-6">
      <NewsDetailView state={{ status: "not-found" }} lang="hu" />
    </div>
  </Page>
);

export const MenuBell: Story = () => {
  const [unread, setUnread] = useState(new Set([12, 11]));
  const [opened, setOpened] = useState<number | null>(null);

  return (
    <Page>
      <div className="flex justify-end px-6">
        <NewsBellView
          items={sampleNews}
          unread={unread}
          lang="hu"
          defaultOpen
          onOpenItem={(number) => {
            setOpened(number);
            setUnread((current) => {
              const next = new Set(current);
              next.delete(number);
              return next;
            });
          }}
          onMarkAllRead={() => setUnread(new Set())}
        />
      </div>
      {opened !== null && (
        <p data-testid="opened" className="px-6">
          {opened}
        </p>
      )}
    </Page>
  );
};
