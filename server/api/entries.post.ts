export default defineEventHandler(async (event) => {
  let body = await readBody<{ filter: { game: string; player: string } }>(
    event
  );

  // let where: {
  //   game: {
  //     name?: string;
  //     GameEntry?: { every: { scores: { every: { player: { name: string } } } } };
  //   };
  // } = { game: {} };

  // if (body.filter.game) {
  //   where.game.name = body.filter.game;
  // }

  // if (body.filter.player) {
  //   where.game.GameEntry = {
  //     every: { scores: { every: { player: { name: body.filter.player } } } },
  //   };
  // }

  let entries = await event.context.prisma.gameEntry.findMany({
    where: {
      game: {
        name: {
          contains: body.filter.game  || '',
        },
      },
      scores: {
        some: {
          player: {
            name: {
              contains: body.filter.player || '',
            },
          },
        },
      },
    },
    include: { game: true, scores: { include: { player: true } } },
  });
  return entries;
});
