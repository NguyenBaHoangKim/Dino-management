import * as forumService from '#services/forum'

export const createForum = async (req, res) => {
    await forumService.createForum(req, res)
}

export const editForum = async (req, res) => {
    await forumService.editForum(req, res)
}

export const deleteForum = async (req, res) => {
    await forumService.deleteForum(req, res)
}

export const getForumById = async (req, res) => {
    await forumService.getForumById(req, res)
}

export const getForumsByUserId = async (req, res) => {
    await forumService.getForumsByUserId(req, res)
}

export const getListForumsBaseOnUserId = async (req, res) => {
    await forumService.getListForumsBaseOnUserId(req, res)
}

export const getListForums = async (req, res) => {
    await forumService.getListForums(req, res)
}

export const likeForum = async (req, res) => {
    await forumService.likeForum(req, res)
}

export const isLikedForum = async (req, res) => {
    return await forumService.isLikedForum(req, res)
}

export const reportForum = async (req, res) => {
    await forumService.repostAForum(req, res)
}

export const getRepostForumByUserId = async (req, res) => {
    await forumService.getRepostByUserId(req, res)
}
