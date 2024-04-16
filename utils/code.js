import {getRelativePath, removeFileExtension, replaceImportPath} from "./strings.js";

export const cleanAIOutput = (code) => code.replace(/```(jest|typescript|javascript|js|ts|jsx|tsx)/gm, '').replaceAll('```', '')

export const AddImportPath = (code, path) => {
    const pathWithoutExtension = removeFileExtension(path)
    const relativePath = getRelativePath(pathWithoutExtension).replaceAll("\\", "/")

    return replaceImportPath(code, `../${relativePath}`)
}
