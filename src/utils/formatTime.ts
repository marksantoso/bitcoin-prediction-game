export const formatTime = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000)
    return `${seconds}s`
}