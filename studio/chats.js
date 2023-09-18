const chats = {}

function generateUniqueChatId (userIds) {
  userIds.sort()
  const potentialChatId = userIds.join('-')

  if (chats[potentialChatId]) {
    return potentialChatId
  }

  chats[potentialChatId] = { users: userIds }
  return potentialChatId
}

module.exports = {
  generateUniqueChatId
}
