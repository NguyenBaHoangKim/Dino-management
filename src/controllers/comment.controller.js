import * as commentService from '#services/comment'

export const createComment = async (req, res) => {
    await commentService.createComment(req, res)
}

export const createSubComment = async (req, res) => {
    await commentService.createSubComment(req, res)
}

export const getAllComments = async (req, res) => {
    await commentService.getAllComments(req, res)
}

export const getCommentsByCommentableId = async (req, res) => {
    await commentService.getCommentsByCommentableId(req, res)
}

export const getAllCommentBySubComment = async (req, res) => {
    await commentService.getCommentByCommentableIdBySubComment(req, res)
}

export const editComment = async (req, res) => {
    await commentService.editComment(req, res)
}

export const deleteComment = async (req, res) => {
    await commentService.deleteComment(req, res)
}

export const likeComment = async (req, res) => {
    await commentService.likeComment(req, res)
}

export const getCommentById = async (req, res) => {
    await commentService.getCommentById(req, res)
}

export const getNguyenComment = async (req, res) => {
    await commentService.getNguyenComment(req, res)
}

export const getNguyenSubComment = async (req, res) => {
    await commentService.getNguyenSubComment(req, res)
}