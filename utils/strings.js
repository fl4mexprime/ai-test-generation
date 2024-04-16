export const convertToTestName = (fileName) => {
    const fileNameStrings = fileName.split('.')
    return `${fileNameStrings[0]}.test.${fileNameStrings[1]}`
}

export const replaceImportPath = (file, path) => file.replace("##IMPORT-PATH##", path)

export const getRelativePath = (file) => file.replace(/.+src\//g, '')

export const removeFileExtension = (file) => file.replace(/.ts|.js/g, '')
