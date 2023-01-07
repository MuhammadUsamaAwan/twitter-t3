import { z } from "zod";

import { router, protectedProcedure } from "../trpc";

export const tweetRouter = router({
  create: protectedProcedure
    .input(z.object({ text: z.string().min(5).max(180) }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.tweet.create({
        data: {
          text: input.text,
          authorId: ctx.session.user.id,
        },
      });
    }),
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const tweets = await ctx.prisma.tweet.findMany({
        take: input.limit,
        select: {
          id: true,
          text: true,
          createdAt: true,
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
      });

      const lastTweet = tweets[input.limit - 1];
      const nextCursor = lastTweet?.id;

      return {
        tweets,
        nextCursor,
      };
    }),
});
