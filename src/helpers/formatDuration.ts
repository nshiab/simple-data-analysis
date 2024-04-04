export default function formatDuration(start: number, end: number): string {
    const differenceInMs = end - start

    if (differenceInMs < 1000) {
        // Less than a second
        return `${differenceInMs} ms`
    } else if (differenceInMs < 60_000) {
        // Less than a minute
        const sec = Math.floor(differenceInMs / 1000)
        const ms = differenceInMs % 1000
        return `${sec} sec, ${ms} ms`
    } else if (differenceInMs < 3_600_000) {
        // Less than an hour
        const min = Math.floor(differenceInMs / 60_000)
        const remainingMs = differenceInMs % 60_000
        const sec = Math.floor(remainingMs / 1000)
        const ms = remainingMs % 1000
        return `${min} min, ${sec} sec, ${ms} ms`
    } else if (differenceInMs < 86_400_000) {
        // Less than a day
        const hours = Math.floor(differenceInMs / 3_600_000)
        const remainingMsAfterHours = differenceInMs % 3_600_000
        const min = Math.floor(remainingMsAfterHours / 60_000)
        const remainingMsAfterMinutes = remainingMsAfterHours % 60_000
        const sec = Math.floor(remainingMsAfterMinutes / 1000)
        const ms = remainingMsAfterMinutes % 1000
        return `${hours} h, ${min} min, ${sec} sec, ${ms} ms`
    } else {
        // At least one day
        const days = Math.floor(differenceInMs / 86_400_000)
        const remainingMsAfterDays = differenceInMs % 86_400_000
        const hours = Math.floor(remainingMsAfterDays / 3_600_000)
        const remainingMsAfterHours = remainingMsAfterDays % 3_600_000
        const min = Math.floor(remainingMsAfterHours / 60_000)
        const remainingMsAfterMin = remainingMsAfterHours % 60_000
        const sec = Math.floor(remainingMsAfterMin / 1000)
        const ms = remainingMsAfterMin % 1000
        return `${days} days, ${hours} h, ${min} min, ${sec} sec, ${ms} ms`
    }
}
