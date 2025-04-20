export const getFirstElement = <T>(array: T[]): T | undefined => {
  return array.length ? array[0] : undefined
}
