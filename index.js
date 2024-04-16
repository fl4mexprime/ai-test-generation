const fs = require('node:fs');
const readline = require("readline");
const postTestRequest = require("./api/open-ai");
const projectDirectory = process.cwd();

const config = JSON.parse(fs.readFileSync(`${projectDirectory}\\node_modules\\ai-test-generation\\package.json`, 'utf-8'))
const userConfig = JSON.parse(fs.readFileSync(`${projectDirectory}\\package.json`, 'utf-8'))

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
        if (!fs.existsSync(`${projectDirectory}\\src`)) {
            console.log("Could not find project src. Make sure you are in the correct directory")
            return;
        }

        // Check if tests directory is present
        if (!fs.existsSync(`${projectDirectory}\\src\\${testsDirectory}`)) {
            console.log(`tests directory (${testsDirectory}) not found or naming is mismatched`)

            const result = await requestUserInput("Create folder in project src now? (y/n): ")

            if (result === 'n') {
                console.log("Aborting, no changes have been made to you project.")
                return
            }

            await fs.mkdirSync(`${projectDirectory}\\src\\${testsDirectory}`)
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

            checkList[index] = `❇️ ${fileName}`

            if (fs.existsSync(`${projectDirectory}\\src\\${testsDirectory}\\${convertToTestName(fileName)}`)) {
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
                checkList[index] = `⚠️ ${fileName}:${response.statusText}`
                throw Error(response.statusText)
            }

            checkList[index] = `✅  ${fileName}`

            clearInterval(interval)

            const data = await response.json()

            const code = data.choices[0].message.content.replaceAll('```', '').replace(/typescript|javascript|js|ts|jsx|tsx/gm, '')

            await fs.writeFileSync(`${projectDirectory}\\src\\${testsDirectory}\\${convertToTestName(fileName)}`, code)

            clearInterval(loadingSpinner())
            index++;
        }

        const endDate = new Date()

        const timeBetween = (endDate.getTime() - startDate.getTime()) / 1000

        console.clear()
        console.log(`Added ${checkList.length} Tests in ${timeBetween} seconds. Check each test-file for errors and run 'jest' to verify the results.`)
    } catch (err) {
        console.error(`⚠️ ${err}`);
    }
}

const requestUserInput = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

const getDirectories = (path) => fs.readdirSync(path, {withFileTypes: true}).filter((item) => item.isDirectory())

const getFilePaths = (path) =>
    fs.readdirSync(path, {withFileTypes: true, recursive: true})
        .filter(dirent => !dirent.isDirectory())
        .filter((dir) => dir.name.match('.ts$'))
        .filter((dir) => !dir.name.match('.test.ts$'))
        .map(dirent => `${dirent.path}\\${dirent.name}`)

const readFile = async (path) => fs.readFileSync(path, 'utf-8')

const convertToTestName = (fileName) => {
    const fileNameStrings = fileName.split('.')
    return `${fileNameStrings[0]}.test.${fileNameStrings[1]}`
}

const loadingSpinner = (progressCount, progressArray) => {
    const h = ['|', '/', '-', '\\'];
    let i = 0;
    const totalCount = progressArray?.length

    return setInterval(() => {
        i = (i > 3) ? 0 : i;

        console.clear();

        const progressBar = `                                                  `.split('')

        console.log(`[${progressBar.map((progress, progressIndex) => {
            let percentage = (Math.floor((progressCount / totalCount) * 100)).toString()

            percentage = percentage.padStart(3, "0")

            if (progressIndex === 24) return percentage
            if (progressIndex === 25) return "%"

            if (progressIndex * 2 < ((progressCount / totalCount) * 100)) return '='

            return progress
        }).join('')}]`)

        console.log(`${progressArray[progressCount]} ${h[i]}`)

        i++;
    }, 150);
};

void analyse()
