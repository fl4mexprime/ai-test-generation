export const loadingSpinner = (progressCount, progressArray) => {
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

// module.exports = {
//     loadingSpinner
// }
