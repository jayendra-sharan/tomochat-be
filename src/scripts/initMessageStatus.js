const { prisma } = require("../lib/prisma");

async function initMessageStatus() {
  const messages = await prisma.message.findMany({
    include: { group: { include: { members: true } } },
  });
  
  console.log("Message count", messages.length);

  for (const message of messages) {
    const groupMembers = message.group.members;
  
    await prisma.messageStatus.createMany({
      data: groupMembers.map((member) => ({
        messageId: message.id,
        userId: member.userId,
        delivered: false,
      })),
      skipDuplicates: true,
    });
  }
}

initMessageStatus();