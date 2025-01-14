import Team from '#models/team'
import TeamMember from '#models/teamMember'
import httpStatus from 'http-status'
import { PAGE, PER_PAGE } from '#constants/index'

export const createTeam = async (req, res) => {
    try {
        const { name, leaderId } = req.body

        const newTeam = new Team({
            name: name,
            leader_id: leaderId,
        })

        const savedTeam = await newTeam.save()

        return res.status(httpStatus.CREATED).json({
            data: savedTeam,
            message: 'Tạo team thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không thể tạo team',
        })
    }
}

export const getAllTeams = async (req, res) => {
    try {
        let { page, perPage } = req.query
        if (!page || !perPage) {
            page = PAGE
            perPage = PER_PAGE
        }

        let teams, totalTeams, totalPages

        if (parseInt(perPage, 10) === -1) {
            teams = await Team.find()
            totalPages = 1
            page = 1
        } else {
            const skip = (page - 1) * perPage
            const limit = parseInt(perPage, 10)
            teams = await Team.find().skip(skip).limit(limit)
            totalTeams = await Team.countDocuments()
            totalPages = Math.ceil(totalTeams / limit)
        }

        return res.status(httpStatus.OK).json({
            data: teams,
            page: parseInt(page, 10),
            totalPages: totalPages,
            message: 'Teams retrieved successfully',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Failed to retrieve teams',
        })
    }
}

export const addTeamMember = async (req, res) => {
    try {
        const { teamId, userIds } = req.body // userIds là mảng chứa các ID của thành viên
        //check team exist
        const team = await Team.findById(teamId).select('leader_id')
        if (!team) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'không tìm thấy Team',
            })
        }
        // Fetch existing team members
        const existingMembers = await TeamMember.find({
            team_id: teamId,
        }).select('user_id')
        const existingUserIds = existingMembers.map((member) =>
            member.user_id.toString(),
        )
        existingUserIds.push(team.leader_id.toString())
        const newUserIds = userIds.filter(
            (userId) => !existingUserIds.includes(userId),
        )

        if (newUserIds.length === 0) {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Tất ca user da co trong team',
            })
        }

        const teamMembers = newUserIds.map((userId) => ({
            team_id: teamId,
            user_id: userId,
        }))

        const savedTeamMembers = await TeamMember.insertMany(teamMembers)

        return res.status(httpStatus.CREATED).json({
            data: savedTeamMembers,
            message: 'Thêm thành viên vào team thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không thể thêm thành viên vào team',
        })
    }
}

export const getTeam = async (req, res) => {
    try {
        const { teamId } = req.params
        const team = await Team.findById(teamId).populate('leader_id')

        if (!team) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy team',
            })
        }

        // Lấy tất cả thành viên của team
        const teamMembers = await TeamMember.find({ team_id: teamId }).populate(
            'user_id',
        )

        return res.status(httpStatus.OK).json({
            data: {
                team,
                members: teamMembers,
            },
            message: 'Lấy thông tin team thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không thể lấy thông tin team',
        })
    }
}

export const updateTeam = async (req, res) => {
    try {
        const { teamId } = req.params
        const { name, leaderId } = req.body

        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            { name, leaderId },
            { new: true },
        )

        if (!updatedTeam) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy team',
            })
        }

        return res.status(httpStatus.OK).json({
            data: updatedTeam,
            message: 'Cập nhật team thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không thể cập nhật team',
        })
    }
}

export const deleteTeam = async (req, res) => {
    try {
        const { teamId } = req.params

        const deletedTeam = await Team.findByIdAndDelete(teamId)

        if (!deletedTeam) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Không tìm thấy team',
            })
        }
        // Delete all team members associated with the team
        await TeamMember.deleteMany({ team_id: teamId })

        return res.status(httpStatus.OK).json({
            message: 'Xóa team thành công',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Không thể xóa team',
        })
    }
}

export const deleteTeamMember = async (req, res) => {
    try {
        const { teamId, userId } = req.params

        const deletedTeamMember = await TeamMember.findOneAndDelete({
            team_id: teamId,
            user_id: userId,
        })

        if (!deletedTeamMember) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'không tìm thấy Team member',
            })
        }

        return res.status(httpStatus.OK).json({
            message: 'Xóa thành công Team member',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'không thể xóa team member',
        })
    }
}
