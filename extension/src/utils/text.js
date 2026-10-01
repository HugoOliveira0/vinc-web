export const truncateText = (text, maxLength = 50) => {
  return text.length > maxLength
    ? `${text.slice(0, maxLength)}…`
    : text
}