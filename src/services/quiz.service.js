import Question from '../models/question.model.js'
import httpStatus from 'http-status'
import Answer from '../models/answer.model.js'
import { uploadImage } from '../utils/github.util.js'
import Exercise from '../models/exercise.model.js'
import xlsx from 'xlsx'

export const createQuiz = async (req, res) => {
    try {
        const { exercise_id, question, answers, correct_answer, index, type } = req.body

        const imageUrl = req.file ? await uploadImage(req, res, 'quiz') : ''

        const exercise = await Exercise.findById(exercise_id)
        // Create a new question
        const newQuestion = new Question({
            index: index,
            lesson_id: exercise.lesson_id,
            exercise_id: exercise_id,
            question: question,
            answers: answers,
            correct_answer: correct_answer,
            image: imageUrl,
            type_answer: type,
        })

        // Save the question to the database
        const savedQuestion = await newQuestion.save()

        return res.status(httpStatus.CREATED).json({
            data: savedQuestion,
            message: 'Tạo Quiz thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Tạo Quiz thất bại',
        })
    }
}

export const importQuizData = async (req, res) => {
    try {
        const { exercise_id } = req.body

        const exercise = await Exercise.findById(exercise_id)
        if (!exercise) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy bài tập',
            })
        }
        // Parse file Excel
        const file = req.file
        const workbook = xlsx.read(file.buffer, { type: 'buffer' })
        const sheetName = workbook.SheetNames[0]
        // Đọc dữ liệu dạng mảng, mỗi hàng là một mảng giá trị theo cột
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' })

        const groupedQuestions = {}
        let currentSTT = null

        // Duyệt từng dòng, bắt đầu từ hàng 2 (bỏ qua hàng tiêu đề)
        for (let rowIndex = 1; rowIndex < sheetData.length; rowIndex++) {
            const row = sheetData[rowIndex]
            let cnt_crt_ans = 0
            // Kiểm tra cột STT (cột 0)
            const stt = row[0]

            // Nếu có STT mới, khởi tạo câu hỏi mới
            if (stt) {
                cnt_crt_ans = 0
                currentSTT = stt
                groupedQuestions[currentSTT] = {
                    question: row[1], // Cột 1: Câu hỏi
                    answers: [],
                    correct_answer: [],
                    type_answer: 'one_choice'
                }

                // Thêm đáp án đầu tiên từ hàng này
                if (row[2]) { // Cột 2: Câu trả lời
                    groupedQuestions[currentSTT].answers.push(row[2])
                    if (row[3] === 'x') { // Cột 3: Câu trả lời đúng
                        groupedQuestions[currentSTT].correct_answer.push(row[2])
                        cnt_crt_ans++
                    }
                }
            } else if (currentSTT) {
                // Nếu không có STT, đây là đáp án tiếp theo của câu hỏi hiện tại
                if (row[2]) { // Cột 2: Câu trả lời
                    groupedQuestions[currentSTT].answers.push(row[2])
                    if (row[3] === 'x') { // Cột 3: Câu trả lời đúng
                        groupedQuestions[currentSTT].correct_answer.push(row[2])
                        cnt_crt_ans++
                    }
                }
                if (cnt_crt_ans > 1) {
                    groupedQuestions[currentSTT].type_answer = 'multiple_choice'
                }
            }
        }

        // Chuyển đổi thành định dạng Question model
        const questions = Object.keys(groupedQuestions).map((stt, index) => ({
            index: parseInt(stt),
            lesson_id: exercise.lesson_id || '',
            exercise_id: exercise_id || '',
            question: groupedQuestions[stt].question,
            answers: groupedQuestions[stt].answers,
            correct_answer: groupedQuestions[stt].correct_answer,
            image: '',
            type_answer: groupedQuestions[stt].type_answer,
        }))

        console.log('Processed questions:', questions)

        // Lưu vào database (bỏ comment khi cần)
        // const savedQuestions = await Question.insertMany(questions)

        return res.status(httpStatus.OK).json({
            data: questions, // Trả về questions để kiểm tra
            message: 'Imported quiz data successfully',
        })
    } catch (e) {
        console.error('Error importing quiz data:', e)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Failed to import quiz data',
        })
    }
}

export const editQuiz = async (req, res) => {
    try {
        const { questionId, question, answers, correct_answer, type } = req.body

        // Update the question
        const updatedQuestion = await Question.findByIdAndUpdate(
            questionId,
            {
                question: question,
                answers: answers,
                correct_answer: correct_answer,
                type_answer: type,
            },
            { new: true },
        )

        if (!updatedQuestion) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy Quiz',
            })
        }

        return res.status(httpStatus.OK).json({
            data: updatedQuestion,
            message: 'Cập nhật Quiz thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Cập nhật Quiz thất bại',
        })
    }
}

export const deleteQuiz = async (req, res) => {
    try {
        const questionId = req.params.id

        // Delete the question
        const deletedQuestion = await Question.findByIdAndDelete(questionId)

        if (!deletedQuestion) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy Quiz',
            })
        }

        return res.status(httpStatus.OK).json({
            data: deletedQuestion,
            message: 'Xóa Quiz thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Xóa Quiz thất bại',
        })
    }
}

export const getQuizById = async (req, res) => {
    try {
        const questionId = req.params.questionId
        const question = await Question.getById(questionId)

        if (!question) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy Quiz',
            })
        }

        return res.status(httpStatus.OK).json({
            data: question,
            message: 'Lấy Quiz thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy Quiz thất bại',
        })
    }
}

export const getAllQuizs = async (req, res) => {
    try {
        const questions = await Question.find()

        return res.status(httpStatus.OK).json({
            data: questions,
            message: 'Lấy tất cả Quiz thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy tất cả Quiz thất bại',
        })
    }
}

export const getQuizsByExerciseId = async (req, res) => {
    try {
        const exerciseId = req.params.exerciseId
        //exclude correct_answer
        const questions = await Question.find({ exercise_id: exerciseId }).select('-correct_answer')

        return res.status(httpStatus.OK).json({
            data: questions,
            message: 'Lấy tất cả Quiz theo exercise ID thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy tất cả Quiz theo exercise ID thất bại',
        })
    }
}

export const getQuizsByExerciseIdForTeacher = async (req, res) => {
    try {
        const exerciseId = req.params.exerciseId
        const questions = await Question.find({ exercise_id: exerciseId })

        return res.status(httpStatus.OK).json({
            data: questions,
            message: 'Lấy tất cả Quiz theo exercise ID thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy tất cả Quiz theo exercise ID thất bại',
        })
    }
}

export const answerQuiz = async (req, res) => {
    try {
        const { questionId, exerciseId, userId, answer } = req.body

        // Find the question
        const question = await Question.findById(questionId)

        if (!question) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy câu hỏi',
            })
        }

        let isCorrect = false
        if (question.type_answer === 'one_choice') {
            isCorrect = JSON.stringify(question.correct_answer) === JSON.stringify(answer)
        } else {
            isCorrect = Array.isArray(answer) && Array.isArray(question.correct_answer) &&
                answer.length === question.correct_answer.length &&
                answer.sort().every((val, index) => val === question.correct_answer.sort()[index])
        }

        // Create a new answer
        const newAnswer = new Answer({
            question_id: questionId,
            exercise_id: question.exercise_id,
            user_id: userId,
            answer: answer,
            is_correct: isCorrect,
        })

        // Save the answer to the database
        await newAnswer.save()

        return res.status(httpStatus.OK).json({
            data: {
                isCorrect: isCorrect,
                correctAnswer: question.correct_answer,
            },
            message: isCorrect ? 'Trả lời câu hỏi đúng' : 'Trả lời câu hỏi sai',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Trả lời câu hỏi thất bại',
        })
    }
}

export const answerMultipleQuestions = async (req, res) => {
    try {
        const { lessonId, userId, answers } = req.body

        // Fetch all questions for the specific lesson
        const questions = await Question.find({ lesson_id: lessonId })

        if (!questions.length) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy câu hỏi cho bài học này',
            })
        }
        let count_correct = 0
        // Iterate over each question and compare the user's answer
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i]
            const userAnswer = answers[i]

            // Check if the answer is correct
            const isCorrect = userAnswer !== '' && question.correct_answer === userAnswer

            // Create a new answer
            const newAnswer = new Answer({
                question_id: question._id,
                lesson_id: lessonId,
                user_id: userId,
                answer: userAnswer || '',
                is_correct: isCorrect,
            })

            // Save the answer to the database
            await newAnswer.save()

            isCorrect && count_correct++
        }

        return res.status(httpStatus.CREATED).json({
            data: {
                correct: count_correct,
                total: questions.length,
            },
            message: 'Trả lời câu hỏi thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Trả lời câu hỏi thất bại',
        })
    }
}

export const getQuizAndAnswerByUserIdAndExerciseId = async (req, res) => {
    try {
        const { userId, exerciseId } = req.body

        // Fetch all answers by the user for the specific lesson
        const answers = await Answer.find({ user_id: userId, exercise_id: exerciseId }).populate('question_id').lean()

        if (!answers.length) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy câu hỏi và câu trả lời theo User ID và Lesson ID',
            })
        }

        return res.status(httpStatus.OK).json({
            data: answers,
            message: 'Lấy câu hỏi và câu trả lời theo User ID và Lesson ID thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Lấy câu hỏi và câu trả lời theo User ID thất bại',
        })
    }
}

export const returnScore = async (req, res) => {

}

export const checkSumittedExercise = async (req, res) => {
    try {
        const { userId, exerciseId } = req.body
        const answer = await Answer.findOne({ user_id: userId, exercise_id: exerciseId })

        if (answer) {
            return res.status(httpStatus.OK).json({
                submitted: true,
                message: 'Bài tập đã được nộp',
            })
        }

        return res.status(httpStatus.OK).json({
            submitted: false,
            message: 'Bài tập chưa được nộp',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Kiểm tra bài tập đã nộp thất bại',
        })
    }
}


