const postTestRequest = async (code,
    {
        apiKey,
        path,
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
                    content: `Generate me a jest test for this function and only respond with code. Add a import from ${path} and don't prefix if it is typescript or javascript. Include multiple tests if possible. Function code: ${code}.`
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

module.exports = postTestRequest
