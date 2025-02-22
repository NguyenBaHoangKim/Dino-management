import express from 'express'
import authRoutes from '#routes/auth'
import userRoutes from '#routes/user'
import projectRoutes from '#routes/project'
import forumRoutes from '#routes/forum'
import lessonRoutes from '#routes/lesson'
import courseRoutes from '#routes/course'
import teamRoutes from '#routes/team'
import commentRoutes from '#routes/comment'
import classroomRoutes from '#routes/classroom'
import assignmentRoutes from '#routes/assignment'
import codeBlockRoutes from '#routes/codeBlock'
import quizRouters from '#routes/quiz'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/project', projectRoutes)
router.use('/forum', forumRoutes)
router.use('/lesson', lessonRoutes)
router.use('/course', courseRoutes)
router.use('/team', teamRoutes)
router.use('/comment', commentRoutes)
router.use('/classroom', classroomRoutes)
router.use('/assignment', assignmentRoutes)
router.use('/code-block', codeBlockRoutes)
router.use('/quiz', quizRouters)

export default router