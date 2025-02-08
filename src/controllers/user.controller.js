import * as userService from '#services/user'
import * as authService from '#services/auth'

export const getUserById = async (req, res) => {
    await userService.getUserById(req, res, req.params.id)
}

export const getCurrentUser = async (req, res) => {
    await userService.getCurrentUser(req, res)
}

export const getAllUsers = async (req, res) => {
    await userService.getAllUsers(req, res)
}

export const sendPasswordReset = async (req, res) => {
    await authService.sendPasswordReset(req, res)
}

export const editUser = async (req, res) => {
    await userService.editUser(req, res)
}

export const changeUserRole = async (req, res) => {
    await userService.changeUserRole(req, res)
}