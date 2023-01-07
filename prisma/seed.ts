import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const USERS_TO_CREATE = 20;
const TWEETS_MIN = 1;
const TWEETS_MAX = 20;

async function run() {
  const userData = Array(USERS_TO_CREATE)
    .fill(null)
    .map(() => ({
      name: faker.internet.userName(),
      email: faker.internet.email(),
      image: faker.image.avatar(),
    }));

  const createUsers = userData.map((user) =>
    prisma.user.create({ data: user })
  );

  const users = await prisma.$transaction(createUsers);

  const tweets = [];

  for (let i = 0; i < users.length; i++) {
    const amount = faker.datatype.number({ min: TWEETS_MIN, max: TWEETS_MAX });

    for (let j = 0; j < amount; j++) {
      tweets.push({
        text: faker.lorem.sentence(),
        author: {
          connect: {
            id: users[j]?.id,
          },
        },
      });
    }
  }

  const createTweets = tweets.map((tweet) =>
    prisma.tweet.create({ data: tweet })
  );

  await prisma.$transaction(createTweets);

  await prisma.$disconnect();
}

run();
