import express from 'express'
import authRoutes from '#routes/auth'
import userRoutes from '#routes/user'
import projectRoutes from '#routes/project'
import forumRoutes from '#routes/forum'
import lessonRoutes from '#routes/lesson'
import courseRoutes from '#routes/course'
import commentRoutes from '#routes/comment'
import classroomRoutes from '#routes/classroom'
import codeBlockRoutes from '#routes/codeBlock'
import quizRouters from '#routes/quiz'
import exerciseRoute from '#routes/exercise'
import scoreRoutes from '#routes/score'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/user', userRoutes)
router.use('/project', projectRoutes)
router.use('/forum', forumRoutes)
router.use('/lesson', lessonRoutes)
router.use('/course', courseRoutes)
router.use('/comment', commentRoutes)
router.use('/classroom', classroomRoutes)
router.use('/code-block', codeBlockRoutes)
router.use('/exercise', exerciseRoute)
router.use('/quiz', quizRouters)
router.use('/score', scoreRoutes)

export default router