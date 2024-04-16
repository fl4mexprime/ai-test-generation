const {readFileSync, readdirSync} = require("fs");

const getImports = (file, path)=> {
    const imports = file.match(/^import .+/gm)

    if (imports === null) return []

    for (const imp of imports) {
        // console.log(imp)
    }

    return imports
}

const getFilePaths = (path) =>
    readdirSync(path, {withFileTypes: true, recursive: true})
        .filter(dirent => !dirent.isDirectory())
        .filter((dir) => dir.name.match('.ts$'))
        .filter((dir) => !dir.name.match('.test.ts$'))
        .map(dirent => `${dirent.path}\\${dirent.name}`)


const getDirectories = (path) => readdirSync(path, {withFileTypes: true}).filter((item) => item.isDirectory())

const readFile = async (path) => readFileSync(path, 'utf-8')

module.exports = {
    getImports,
    getFilePaths,
    getDirectories,
    readFile
}

