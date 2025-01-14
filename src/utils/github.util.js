import config from '#configs/environment'
import fs from 'fs'
import axios from 'axios'
import httpStatus from 'http-status'

const { repo, owner, token, baseUrl } = config.github

export const uploadImage = async (req, res, folder) => {
    try {
        const namePath = `uploads/${req.file.filename}`
        const fileData = fs.readFileSync(namePath)

        const base64Image = fileData.toString('base64')

        const response = await axios.put(
            `${baseUrl}/repos/${owner}/${repo}/contents/${folder}/${req.file.filename}`,
            {
                message: 'Upload image via GitHub API',
                content: base64Image,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github+json',
                },
            },
        )
        fs.unlinkSync(namePath)
        console.log('File uploaded successfully:', response.data)

        return `https://raw.githubusercontent.com/${owner}/${repo}/main/${folder}/${req.file.filename}`
    } catch (e) {
        return res.status(e.status || httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Tải ảnh thất bại',
        })
    }
}