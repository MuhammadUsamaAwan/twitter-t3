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
});
