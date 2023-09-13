const studios = {}

function addUserToStudio (studioId, userId, socketId, path, status = 'connected') {
  if (!studios[studioId]) {
    studios[studioId] = {}
  }
  studios[studioId][userId] = { socketId, currentPage: path, status }
}

function removeUserFromStudio (socketId) {
  for (const studio in studios) {
    for (const user in studios[studio]) {
      if (studios[studio][user].socketId === socketId) {
        delete studios[studio][user]
      }
    }
  }
}

function updateUserStatus (studioId, userId, status) {
  if (studios[studioId] && studios[studioId][userId]) {
    studios[studioId][userId].status = status
  }
}

function getConnectedUsersInStudio (studioId) {
  return studios[studioId] ? Object.keys(studios[studioId]) : []
}

function getUserSocketIdInStudio (studioId, userId) {
  const studio = studios[studioId]
  if (studio && studio[userId]) {
    return studio[userId].socketId
  }
  return null
}

module.exports = {
  addUserToStudio,
  removeUserFromStudio,
  getConnectedUsersInStudio,
  updateUserStatus,
  getUserSocketIdInStudio
}
