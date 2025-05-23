const { prisma } = require("../lib/prisma");

async function initMessageStatus() {
  const messages = await prisma.message.findMany({
    include: { room: { include: { members: true } } },
  });
  
  console.log("Message count", messages.length);

  for (const message of messages) {
    const roomMembers = message.room.members;
  
    await prisma.messageStatus.createMany({
      data: roomMembers.map((member) => ({
        messageId: message.id,
        userId: member.userId,
        delivered: false,
      })),
      skipDuplicates: true,
    });
  }
}

initMessageStatus();