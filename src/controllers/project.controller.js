import * as projectService from '#services/project'

export const createProject = async (req, res) => {
    await projectService.createProject(req, res)
}

export const cloneProject = async (req, res) => {
    await projectService.cloneProject(req, res)
}

export const editProject = async (req, res) => {
    await projectService.editProject(req, res)
}

export const deleteProject = async (req, res) => {
    await projectService.deleteProject(req, res)
}

export const getProjectById = async (req, res) => {
    await projectService.getProjectById(req, res)
}

export const getListProjects = async (req, res) => {
    await projectService.getProjectsPerPage(req, res)
}

export const getListProjectsByName = async (req, res) => {
    await projectService.getListProjectsByName(req, res)
}

export const getProjectsByUserId = async (req, res) => {
    await projectService.getProjectsByUserId(req, res)
}

export const getFavoriteProjects = async (req, res) => {
    await projectService.getFavoriteProjects(req, res)
}

export const addProjectToFavorites = async (req, res) => {
    await projectService.addProjectToFavorites(req, res)
}

export const likeProject = async (req, res) => {
    await projectService.likeProject(req, res)
}

export const isLikedProject = async (req, res) => {
    await projectService.isLikedProject(req, res)
}

export const setTypeProject = async (req, res) => {
    await projectService.setTypeProject(req, res)
}

export const getProjectsByType = async (req, res) => {
    await projectService.getProjectsByType(req, res)
}

export const pushImage = async (req, res) => {
    await projectService.pushImage(req, res)
}