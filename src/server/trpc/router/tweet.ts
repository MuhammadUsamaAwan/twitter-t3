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
        take: input.limit,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      const lastTweet = tweets[input.limit - 1];
      const nextCursor = lastTweet?.id;

      return {
        tweets,
        nextCursor,
      };
    }),
  like: protectedProcedure
    .input(z.object({ tweetId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.like.create({
        data: {
          userId: ctx.session.user.id,
          tweetId: input.tweetId,
        },
      });
    }),
  unlike: protectedProcedure
    .input(z.object({ tweetId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.like.delete({
        where: {
          tweetId_userId: {
            tweetId: input.tweetId,
            userId: ctx.session.user.id,
          },
        },
      });
    }),
});
