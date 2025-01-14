import express from 'express'
import * as teamController from '#controllers/team'
import validate from '#middlewares/validation'

const router = express.Router()

router
    .route('/')
    .post(validate, teamController.createTeam)
    .get(teamController.getAllTeams)

router.route('/member').post(teamController.addTeamMember)

router
    .route('/:teamId')
    .get(teamController.getTeam)
    .put(validate, teamController.updateTeam)
    .delete(teamController.deleteTeam)

router.route('/:teamId/member/:userId').delete(teamController.deleteTeamMember)

export default router
