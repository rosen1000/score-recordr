import { Game } from "@prisma/client";

export default defineEventHandler<Promise<{error?: string, succsess?: boolean}>>(async (event) => {
  const body = (await readBody(event)) as {
    game: Game;
    players: { name: string; score: number; color: string }[];
    ready: boolean;
    loading: boolean;
    won: boolean;
  };

  let check = (p: { name: string; score: number; color: string }) =>
    p.name.length >= 2 && p.score > 0 && p.color;
  if (
    !body ||
    !body.game ||
    body.game.minPlayers > body.players.length ||
    body.game.maxPlayers < body.players.length ||
    body.players.filter(check).length != body.players.length
  )
    return { error: "Invalid body" };

  let scoreGenerator = () => {
    let scores = [];
    for (let player of body.players) {
      scores.push({
        player: {
          connectOrCreate: {
            where: { name: player.name },
            create: { name: player.name },
          },
        },
        score: player.score,
        color: player.color,
        won: body.won,
      });
    }
    return scores;
  };

  try {
    await event.context.prisma.gameEntry.create({
      data: {
        game: { connect: { id: body.game.id } },
        scores: {
          create: scoreGenerator(),
        },
      },
    });
    return {succsess: true};
  } catch (e) {
    console.log(e);
    return {error: 'unknown'};
  }
});
