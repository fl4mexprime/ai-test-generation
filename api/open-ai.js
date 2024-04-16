const postTestRequest = async (code,
    {
        apiKey,
        model
    }
) => {
    const request = {
        method: "POST",
        headers: {
            authorization: `Bearer ${apiKey}`,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            model,
            messages: [
                {
                    role: "user",
                    content: `Generate me a test for this function using jest and only respond with code. add the import from ##IMPORT-PATH## - Check if it is a named export. Include multiple tests. Function code: ${code}.`
                }
            ],
            temperature: 1,
            top_p: 1,
            n: 1,
            stream: false,
            max_tokens: 1000,
            presence_penalty: 0,
            frequency_penalty: 0
        })
    }

    return fetch("https://api.openai.com/v1/chat/completions", request)
}

export default postTestRequest
