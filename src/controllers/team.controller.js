import * as teamService from '#services/team'

export const createTeam = async (req, res) => {
    await teamService.createTeam(req, res)
}

export const addTeamMember = async (req, res) => {
    await teamService.addTeamMember(req, res)
}

export const getTeam = async (req, res) => {
    await teamService.getTeam(req, res)
}

export const updateTeam = async (req, res) => {
    await teamService.updateTeam(req, res)
}

export const deleteTeam = async (req, res) => {
    await teamService.deleteTeam(req, res)
}

export const deleteTeamMember = async (req, res) => {
    await teamService.deleteTeamMember(req, res)
}

export const getAllTeams = async (req, res) => {
    await teamService.getAllTeams(req, res)
}