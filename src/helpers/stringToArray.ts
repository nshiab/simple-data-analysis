export default function stringToArray(argument: string | string[]) {
  if (Array.isArray(argument)) {
    return argument;
  } else if (typeof argument === "string") {
    return [argument];
  } else {
    throw new Error(`argument should be a string or an array of strings.`);
  }
}
