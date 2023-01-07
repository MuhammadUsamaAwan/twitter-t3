// imports
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { trpc } from "../utils/trpc";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";

dayjs.extend(relativeTime);
dayjs.extend(updateLocal);
dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1M",
    MM: "%dM",
    y: "1y",
    yy: "%dy",
  },
});

// useScrollPosition Custom Hook
function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;

    const scrolled = (winScroll / height) * 100;
    setScrollPosition(scrolled);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollPosition;
}

// Home Page
export default function Home() {
  const [text, setText] = useState("");
  const scrollPosition = useScrollPosition();
  const { status, data: session } = useSession();
  // create tweet
  const { mutateAsync, isLoading } = trpc.tweet.create.useMutation({
    onSuccess: () => setText(""),
  });
  // tweet inifinite query
  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.tweet.getAll.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );
  // get tweets
  const tweets = data?.pages.flatMap((page) => page.tweets ?? []);

  // fetch more tweets
  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);

  if (status === "loading") {
    return <div className="text-white">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="grid place-content-center">
        <div className="rounded-lg border border-white py-5 px-10">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Welcome to Twitter!
          </h2>
          <div className="flex justify-center">
            <button
              type="button"
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm text-white selection:font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-800"
              onClick={() => signIn()}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[310px] border-white p-2 sm:border-l sm:border-r md:w-[40rem] lg:w-[50rem]">
      {/* sign out */}
      <div className="mb-2 flex items-center justify-between">
        <div className="text-white">{session?.user?.name}</div>
        <button
          type="button"
          className="mr-2 mb-2 rounded-lg border-gray-700 bg-gray-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-700"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      </div>
      {/* create tweet */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.length > 5 && text.length < 180) mutateAsync({ text });
        }}
        className="mb-2"
      >
        <textarea
          rows={4}
          placeholder="Tweet..."
          className="m w-full rounded border-gray-600 bg-gray-700 p-2.5 text-white placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-blue-500"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            disabled={isLoading}
            type="submit"
            className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm text-white selection:font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-800 disabled:cursor-not-allowed"
          >
            Tweet
          </button>
        </div>
      </form>
      {/* tweets */}
      {tweets?.map((tweet) => (
        <article key={tweet.id} className="mb-2 py-2 text-white">
          <div className="flex items-start space-x-2">
            <Image
              className="rounded-full"
              src={tweet.author.image || ""}
              alt="tweet"
              width={40}
              height={40}
            />
            <div>
              <div className="flex items-center space-x-2">
                <div className="font-semibold">{tweet.author.name}</div>
                <div>. {dayjs(tweet.createdAt).fromNow()}</div>
              </div>
              <p className="font-light">{tweet.text}</p>
              <button>Like</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
