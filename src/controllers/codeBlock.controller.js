import * as codeService from '#services/codeBlock'

export const createCode = async (req, res) => {
    await codeService.createCode(req, res)
}

export const getLatestCode = async (req, res) => {
    await codeService.getLatestCode(req, res)
}

export const postCode = async (req, res) => {
    await codeService.postCode(req, res)
}