import {
  pdf,
  Page,
  Document,
  Text,
  View,
  Font,
  StyleSheet,
} from "@react-pdf/renderer"
import { Editor, Text as SlateText } from "slate"
import { toast } from "sonner"

const parseEditor = editor => (
  <View>{editor.children.map(blockChild => parseNode(blockChild))}</View>
)

const parseParagraph = p => (
  <View
    style={{
      display: "flex",
      flexDirection: "row",
    }}
  >
    {p.children.map(inlineChild => parseNode(inlineChild))}
  </View>
)

const parseBulletedList = l => (
  <View>
    {l.children.map(listItem => (
      <View
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Text>{`• `}</Text>
        {parseNode(listItem)}
      </View>
    ))}
  </View>
)

const parseNumberedList = l => (
  <View>
    {l.children.map((listItem, index) => (
      <View
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Text>{`${++index}. `} </Text>
        {parseNode(listItem)}
      </View>
    ))}
  </View>
)

const parseListItem = i => (
  <View
    style={{
      display: "flex",
      flexDirection: "row",
    }}
  >
    {i.children.map(inlineChild => parseNode(inlineChild))}
  </View>
)

const parseStampedElement = s => (
  <View
    style={{
      display: "flex",
      flexDirection: "row",
    }}
  >
    {s.children.map(inlineChild => parseNode(inlineChild))}
  </View>
)

const parseText = t => {
  let styles = { fontFamily: "Times-Roman" }

  if (t?.underline) {
    styles.textDecoration = "underline"
  }

  // Order matters here as only one font family can be applied
  if (t?.bold) {
    styles.fontFamily = "Times-Bold"
  }
  if (t?.italic) {
    styles.fontFamily = "Times-Italic"
  }
  if (t?.bold && t.italic) {
    styles.fontFamily = "Times-BoldItalic"
  }
  if (t?.code) {
    styles.fontFamily = "Courier"
  }

  return (
    <Text style={styles}>
      {`${t.text === "" ? "\n" : t.text}`}
    </Text>
  )
}

const parseNode = node => {
  try {
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
        //  * Editor
        //  * Leaf
        //  * Inline
        //  * Invalid/misplaced (error)
        if (Editor.isEditor(node)) {
          return parseEditor(node)
        } else if (SlateText.isText(node)) {
          return parseText(node)
        } else {
          throw Error(`${node.type} is either an invalid or misplaced node`)
        }
      }
    }
  } catch (error) {
    throw error
  }
}

const styles = StyleSheet.create({
  pageContainer: {
    paddingTop: 50,
    paddingHorizontal: 50,
    paddingBottom: 70,
    fontSize: 11,
  },
  pageNumber: {
    bottom: 30,
    left: 0,
    right: 0,
    marginTop: "auto",
    position: "absolute",
    textAlign: "center",
    fontFamily: "Times-Roman",
    fontSize: 9,
  }
})

const MyDocument = ({ content }) => (
  <Document>
    <Page style={styles.pageContainer}>
      {content}
      <Text
        fixed
        render={({ pageNumber }) => `${pageNumber}`}
        style={styles.pageNumber}
      />
    </Page>
  </Document>
)

Font.register({
  family: "Times-Roman",
})

export const downloadPdf = async editor => {
  try {
    const parsedEditor = parseNode(editor)
    const blob = await pdf(<MyDocument content={parsedEditor} />).toBlob()

    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.target = "_blank"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      URL.revokeObjectURL(link.href)
    }, 1000)
  } catch (error) {
    toast.error("Failed to convert notes to PDF")
    console.error(error)
  }
}

