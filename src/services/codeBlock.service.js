import CodeBlock from '#models/codeBlock'
import httpStatus from 'http-status'

export const createCode = async (req, res) => {
    try {
        const { javascriptCode, jsonCode, xmlCode } = req.body

        const newCode = new CodeBlock({
            javascriptCode,
            jsonCode,
            xmlCode,
        })

        const savedCode = await newCode.save()

        return res.status(httpStatus.CREATED).json({
            data: savedCode,
            message: 'Code saved successfully',
        })
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Failed to save code',
        })
    }
}

// get the lastest code
export const getLatestCode = async (req, res) => {
    try {
        const code = await CodeBlock.findOne().sort({ createdAt: -1 })

        return res.status(httpStatus.OK).json({
            data: code,
            message: 'Get the lastest code successfully',
        })
    }
    catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message || 'Failed to get the lastest code',
        })
    }
}