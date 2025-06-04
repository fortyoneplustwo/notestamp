import { Node, Text } from "slate"

const chars = [
  "/",
  "`",
  "*",
  "_",
  "{",
  "}",
  "[",
  "]",
  "(",
  ")",
  "#",
  "+",
  "-",
  ".",
  "!",
]
const special = new Map()
chars.forEach(char => special.set(char, char))

const parseHead = head =>
  `${head.children.map(blockChild => parseNode(blockChild)).join("")}`

const parseParagraph = p =>
  `${p.children.map(child => parseNode(child)).join("")}\n`

const parseStampedElement = s =>
  `[${s?.label}] ${s.children.map(inline => parseNode(inline)).join("")}`

const parseListItem = i =>
  `${i.children.map(inline => parseNode(inline)).join("")}\n`

const parseBulletedList = l =>
  `\n${l.children.map(listItem => `* ${parseNode(listItem)}`).join("")}`

const parseNumberedList = l =>
  `\n${l.children
    .map((listItem, index) => `${++index}. ${parseNode(listItem)}`)
    .join("")}`

// Helper to escape special markdown chars
const escapeMd = t =>
  t.text
    .split("")
    .map(char => (special.has(char) ? `\\${char}` : char))
    .join("")

const parseText = t => {
  let safeT = escapeMd(t)

  if (t?.code) {
    // Code should not be emphasized
    safeT = `\`${safeT}\``
  } else {
    if (t?.underline || t?.italic) {
      safeT = `_${safeT}_`
    }
    if (t?.bold) {
      safeT = `*${safeT}*`
    }
  }

  return t.text === "\n" ? "" : `${safeT}`
}

const parseNode = node => {
  switch (node.type) {
    case "paragraph":
      return parseParagraph(node)
    case "stamped-item":
      return parseStampedElement(node)
    case "list-item":
      return parseListItem(node)
    case "bulleted-list":
      return parseBulletedList(node)
    case "numbered-list":
      return parseNumberedList(node)
    default: {
      // Node must be one of:
      //  * Head
      //  * Leaf
      //  * Inline
      //  * Invalid/misplaced (error)
      if (node.type === "head") {
        return parseHead(node)
      } else if (Text.isText(node)) {
        return parseText(node)
      } else {
        throw Error(`${node.type} is either an invalid or misplaced node`)
      }
    }
  }
}

export const toMarkdown = children => {
  if (!Node.isNodeList(children)) {
    throw Error("Argument must be Node[]")
  }
  // Head is a wrapper to replace the editor object
  const head = { type: "head", children: children }
  return `${parseNode(head)}`
}
