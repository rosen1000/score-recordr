export default defineEventHandler(async (event) => {
  let games = await event.context.prisma.game.findMany();
  return games;
});
