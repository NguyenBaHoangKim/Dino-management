import config from '#configs/environment'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import httpStatus from 'http-status'

const { repo, owner, token, baseUrl } = config.github

export const uploadImage = async (req, res, folder) => {
    try {
        const fileExtension = req.file.originalname.split('.').pop()
        const uniqueFilename = `${uuidv4()}.${fileExtension}`

        const base64Image = req.file.buffer.toString('base64')

        const response = await axios.put(
            `${baseUrl}/repos/${owner}/${repo}/contents/${folder}/${uniqueFilename}`,
            {
                message: 'Upload new image via GitHub API',
                content: base64Image,
                branch: 'main',
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github+json',
                },
            }
        )

        console.log('File uploaded successfully:', response.data)

        return `https://raw.githubusercontent.com/${owner}/${repo}/main/${folder}/${uniqueFilename}`
    } catch (e) {
        return res.status(e.response?.status || httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.response?.data?.message || e.message || 'Tải ảnh thất bại',
        })
    }
}
