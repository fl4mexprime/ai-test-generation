import {readFileSync, existsSync, mkdirSync, writeFileSync} from "fs";
import {requestUserInput} from "./utils/input.js";
import {getDirectories, getFilePaths, getImports, readFile} from "./utils/files.js";
import {convertToTestName} from "./utils/strings.js";
import {loadingSpinner} from "./utils/output.js";
import postTestRequest from "./api/open-ai.js";
import {AddImportPath, cleanAIOutput} from "./utils/code.js";

const projectDirectory = process.cwd();

const config = JSON.parse(readFileSync(`${projectDirectory}\\node_modules\\ai-test-generation\\package.json`, 'utf-8'))
const userConfig = JSON.parse(readFileSync(`${projectDirectory}\\package.json`, 'utf-8'))

// Default-Config
const defaultTestsDirectory = config['tests-directory']
const defaultModel = config['model']
const defaultIgnoredDirectories = config['ignored-directories']

// User-Config
const userTestsDirectory = userConfig['ai-test-generation']['tests-directory']
const userApiKey = userConfig['ai-test-generation']['api-key']
const userModel = userConfig['ai-test-generation']['model']
const userIgnoredDirectories = userConfig['ai-test-generation']['ignored-directories']

// Final config
const testsDirectory = userTestsDirectory ?? defaultTestsDirectory
const apiKey = userApiKey;
const model = userModel ?? defaultModel
const ignoredDirectories = [testsDirectory, ...defaultIgnoredDirectories, ...(userIgnoredDirectories?.length > 0 ? userIgnoredDirectories : [])]

let checkList = [];

const analyse = async () => {
    try {
        //Check api-key
        if (!apiKey) {
            console.log('Please provide a api-key in your package.json', {
                "ai-test-generation": {
                    'api-key': "{YOUR API KEY}"
                }
            })
            return;
        }

        // Check if src directory is present
        if (!existsSync(`${projectDirectory}\\src`)) {
            console.log("Could not find project src. Make sure you are in the correct directory")
            return;
        }

        // Check if tests directory is present
        if (!existsSync(`${projectDirectory}\\src\\${testsDirectory}`)) {
            console.log(`tests directory (${testsDirectory}) not found or naming is mismatched`)

            const result = await requestUserInput("Create folder in project src now? (y/n): ")

            if (result === 'n') {
                console.log("Aborting, no changes have been made to you project.")
                return
            }

            await mkdirSync(`${projectDirectory}\\src\\${testsDirectory}`)
        }

        // Get all valid directories
        const validDirectories = getDirectories(`${projectDirectory}\\src`)
            .filter((dir) => !ignoredDirectories.includes(dir.name))
            .map((dir) => dir.name)

        // Ask user to consent that his project files will be searched
        const result2 = await requestUserInput(`\nFollowing directories will be searched: [${validDirectories.join(', ')}] Continue? (y/n): `)

        if (result2 === 'n') {
            console.log("Aborting, no changes have been made to you project.")
            return;
        }

        // Create list of valid directories
        const filePaths = validDirectories.flatMap((directory) => getFilePaths(`${projectDirectory}\\src\\${directory}`))

        checkList = filePaths.map((path) => {
            const strings = path.split('\\')
            return `${strings[strings.length - 1]}`
        })

        let index = 0;
        const startDate = new Date()

        // Loop each path
        for (const path of filePaths) {
            const pathStrings = path.split('\\')
            const fileName = pathStrings[pathStrings.length - 1];

            if (existsSync(`${projectDirectory}\\src\\${testsDirectory}\\${convertToTestName(fileName)}`)) {
                checkList.splice(index, 1)
                continue
            }

            const content = await readFile(path)

            const interval = loadingSpinner(index, checkList)

            // Query api
            const response = await postTestRequest(content, {
                apiKey,
                model,
                filePath: `../${path.split("src\\")[1].replace('\\', '/').replace(/.ts|.js/gm, '')}`,
                ownPath: `${projectDirectory}\\src\\${testsDirectory}`
            })

            if (!response.ok) {
                Error(response.statusText)
            }

            clearInterval(interval)

            const data = await response.json()

            const code = cleanAIOutput(data.choices[0].message.content)
            const codeWithImports = AddImportPath(code, path)

            const imports = getImports(content, path)

            await writeFileSync(`${projectDirectory}\\src\\${testsDirectory}\\${convertToTestName(fileName)}`, `${imports.join("\n")}\n${codeWithImports}`.trim())
            index++;
        }

        const endDate = new Date()

        const timeBetween = (endDate.getTime() - startDate.getTime()) / 1000

        // Display results
        console.clear()
        console.log(`Added ${checkList.length} Test${checkList.length > 1 ? "s" : ""} in ${timeBetween} seconds. Check each test-file for errors and run 'jest' to verify the results.`)
    } catch (err) {
        console.error(`⚠️ ${err}`);
    }
}

void analyse()
