import express from 'express'
import * as assignmentController from '#controllers/assignment'

const router = express.Router()

router
    .route('/')
    .post(assignmentController.createAssignment)
    .get(assignmentController.getAllAssignments)

router
    .route('/:id')
    .get(assignmentController.getAssignmentById)
    .put(assignmentController.updateAssignment)
    .delete(assignmentController.deleteAssignment)

export default router