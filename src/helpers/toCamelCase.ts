export default function toCamelCase(input: string): string {
    const words = input.replace(/[^a-zA-Z0-9\s]/g, " ").split(/\s+/)

    // Convert to camelCase
    const camelCaseString = words
        .map((word, index) => {
            // Lowercase the entire string first
            word = word.toLowerCase()

            // Capitalize the first letter of each word except the first one
            if (index > 0) {
                word = word.charAt(0).toUpperCase() + word.slice(1)
            }

            return word
        })
        .join("")

    return camelCaseString
}
