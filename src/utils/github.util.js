import config from '#configs/environment'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'
import httpStatus from 'http-status'
import path from 'path'

const { repo, owner, token, baseUrl } = config.github

export const uploadImage = async (req, res, folder) => {
    try {
        const originalName = path.parse(req.file.originalname).name.replace(/\s+/g, '-')
        const extension = path.extname(req.file.originalname)
        const uniqueFilename = `${originalName}-${uuidv4()}${extension}`

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
