import { useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { trpc } from "../utils/trpc";

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

interface Props {
  tweet: {
    Like: {
      user: {
        id: string;
        name: string | null;
      };
    }[];
    _count: {
      Like: number;
    };
    id: string;
    author: {
      name: string | null;
      image: string | null;
    };
    text: string;
    createdAt: Date;
  };
  userId: string;
}

export default function TweetComponent({ tweet, userId }: Props) {
  const [likes, setLikes] = useState(tweet._count.Like);
  const [hasLiked, setHasLiked] = useState(
    tweet.Like.some((like) => like.user.id === userId)
  );
  const like = trpc.tweet.like.useMutation({
    onSuccess: () => {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    },
  });
  const unlike = trpc.tweet.unlike.useMutation({
    onSuccess: () => {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    },
  });

  return (
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
          <div className="space-x-2">
            <span>{likes}</span>
            <button
              onClick={() => {
                if (!like.isLoading && !unlike.isLoading) {
                  if (hasLiked) {
                    unlike.mutateAsync({ tweetId: tweet.id });
                  } else {
                    like.mutateAsync({ tweetId: tweet.id });
                  }
                }
              }}
            >
              {hasLiked ? "Unlike" : "Like"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
