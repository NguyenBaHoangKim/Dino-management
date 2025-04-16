import CodeBlock from '#models/codeBlock'
import httpStatus from 'http-status'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process';

const execAsync = promisify(exec)
// ESM-style __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function getArduinoCommand() {
    const guesses = [
        'C:\\Program Files\\Arduino\\Arduino.exe',
        'C:\\Program Files\\Arduino\\Arduino_debug.exe',
        'C:\\Program Files (x86)\\Arduino\\Arduino.exe',
        'C:\\Program Files (x86)\\Arduino\\Arduino_debug.exe',
    ]

    for (const guess of guesses) {
        if (fs.existsSync(guess)) {
            console.log('Đã tìm thấy Arduino tại:', guess)
            return guess
        }
    }

    console.warn('Không tìm thấy Arduino trong các đường dẫn phổ biến, sẽ dùng "arduino" từ PATH.')
    return 'arduino' // fallback nếu có sẵn trong PATH
}

export function guessPortName() {
    try {
        const output = execSync('reg query HKEY_LOCAL_MACHINE\\HARDWARE\\DEVICEMAP\\SERIALCOMM', { encoding: 'utf8' })
        const matches = [...output.matchAll(/REG_SZ\s+(COM\d+)/g)]
        if (matches.length > 0) {
            const lastPort = matches[matches.length - 1][1]
            console.log('Đã đoán được COM port:', lastPort)
            return lastPort
        }
    } catch (err) {
        console.error('Lỗi khi đoán COM port:', err)
    }
    return 'COM3' // fallback nếu không đoán được
}

export const postCode = async (req, res) => {
    try {
        const { code } = req.body

        // Get Arduino command and port
        const arduinoCmd = getArduinoCommand()
        const port = guessPortName()

        // Create temporary directory
        const rootDir = path.resolve(__dirname, '../../');
        const tempDir = path.join(rootDir, 'temp_sketch')
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir)
        }

        // Create a unique file for the sketch
        const filePath = path.join(tempDir, `sketch_${Date.now()}.ino`)
        fs.writeFileSync(filePath, code)

        // Build the upload command
        const cmd = `"${arduinoCmd}" --upload --port ${port} "${filePath}"`
        console.log('Executing command:', cmd)

        // Execute the command
        const { stdout, stderr } = await execAsync(cmd) //lan dau tien thi thoang no chua xoa duoc
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log('Đã xóa file tạm:', filePath);
        }
        // Return success response
        return res.status(httpStatus.OK).json({
            success: true,
            message: stdout || 'Upload successful!',
        })
    } catch (err) {
        // Handle errors and return failure response
        console.error('Error during upload:', err)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: err.stderr || err.message || 'Upload failed.',
        })
    }
}

export const runCode = async (req, res) => {
    try {
        const { code } = req.body
        console.log('Codeee:', code)
        const { stdout, stderr } = await execAsync(code)

        return res.status(httpStatus.OK).json({
            success: true,
            message: stdout || 'Upload successful!',
        })
    } catch (err) {
        // Handle errors and return failure response
        console.error('Error during upload:', err)
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: err.stderr || err.message || 'Upload failed.',
        })
    }
}



// export const createCode = async (req, res) => {
//     try {
//         const { javascriptCode, jsonCode, xmlCode } = req.body
//
//         const newCode = new CodeBlock({
//             javascriptCode,
//             jsonCode,
//             xmlCode,
//         })
//
//         const savedCode = await newCode.save()
//
//         return res.status(httpStatus.CREATED).json({
//             data: savedCode,
//             message: 'Code saved successfully',
//         })
//     } catch (e) {
//         return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//             message: e.message || 'Failed to save code',
//         })
//     }
// }
// get the lastest code
// export const getLatestCode = async (req, res) => {
//     try {
//         const code = await CodeBlock.findOne().sort({ createdAt: -1 })
//
//         return res.status(httpStatus.OK).json({
//             data: code,
//             message: 'Get the lastest code successfully',
//         })
//     } catch (e) {
//         return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//             message: e.message || 'Failed to get the lastest code',
//         })
//     }
// }

