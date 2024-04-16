import {readdirSync, readFileSync} from "fs";

export const getImports = (file, path)=> {
    const imports = file.match(/^import .+/gm)

    if (imports === null) return []

    for (const imp of imports) {
        // console.log(imp)
    }

    return imports
}

export const getFilePaths = (path) =>
    readdirSync(path, {withFileTypes: true, recursive: true})
        .filter(dirent => !dirent.isDirectory())
        .filter((dir) => dir.name.match('.ts$'))
        .filter((dir) => !dir.name.match('.test.ts$'))
        .map(dirent => `${dirent.path}\\${dirent.name}`)


export const getDirectories = (path) => readdirSync(path, {withFileTypes: true}).filter((item) => item.isDirectory())

export const readFile = async (path) => readFileSync(path, 'utf-8')
