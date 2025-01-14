import * as assignmentService from '#services/assignment'

export const createAssignment = async (req, res) => {
    await assignmentService.createAssignment(req, res)
}

export const getAllAssignments = async (req, res) => {
    await assignmentService.getAllAssignments(req, res)
}

export const getAssignmentById = async (req, res) => {
    await assignmentService.getAssignmentById(req, res)
}

export const updateAssignment = async (req, res) => {
    await assignmentService.updateAssignment(req, res)
}

export const deleteAssignment = async (req, res) => {
    await assignmentService.deleteAssignment(req, res)
}