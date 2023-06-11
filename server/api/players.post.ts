export default defineEventHandler(async (event) => {
  return (await event.context.prisma.player.findMany()).map((p) => p.name);
});
