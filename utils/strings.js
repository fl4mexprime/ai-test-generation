const convertToTestName = (fileName) => {
    const fileNameStrings = fileName.split('.')
    return `${fileNameStrings[0]}.test.${fileNameStrings[1]}`
}

const replaceImportPath = (file, path) => file.replace("##IMPORT-PATH##", path)

const getRelativePath = (file) => file.replace(/.+src\//g, '')

const removeFileExtension = (file) => file.replace(/.ts|.js/g, '')

module.exports = {
    convertToTestName,
    replaceImportPath,
    removeFileExtension,
    getRelativePath
}
