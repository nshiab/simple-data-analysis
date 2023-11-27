export default function addThousandSeparator(number: number) {
    const regex = /\B(?=(\d{3})+(?!\d))/g
    return number.toString().replace(regex, ",")
}
