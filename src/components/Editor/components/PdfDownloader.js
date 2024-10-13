import { pdf, Page, Document, Text, View, Font } from '@react-pdf/renderer';
import React from 'react';

const parseSlateTextNode = (node) => {
  if (node.text) {
    let styles = {}

    if (node.underline) {
      styles.textDecoration = 'underline';
    }
    if (node.bold) {
      styles.fontFamily = "Helvetica-Bold"
    }
    if (node.italic) {
      styles.fontFamily = "Helvetica-Oblique"
    }
    if (node.bold && node.italic) {
      styles.fontFamily = "Helvetica-BoldOblique"
    }
    if (node.code) {
      styles.fontFamily = "Courier"
    }

    return (
      <Text style={styles}>
        {node.text}
      </Text>
    )
  }
  return null
}

const parseSlateNode = (node) => {
  switch (node.type) {
    case 'paragraph': {
      if (node.children.length === 1 && node.children[0].text === '') {
        return (
          <Text key={Math.random()}>{'\n'}</Text>
        );
      }
      return (
        <Text key={Math.random()} style={{ display: "flex", flexWrap: "wrap" }}>
          {node.children.map((child) => parseSlateNode(child))}
        </Text>
      );
    }

    case 'bulleted-list': {
      return (
        <View>
          {node.children.map((child, index) => (
            <View key={index}>
              <Text>• {parseSlateNode(child)}</Text>
            </View>
          ))}
        </View>
      );
    }

    case 'numbered-list': {
      return (
        <View>
          {node.children.map((child, index) => (
            <View key={index}>
              <Text>{index + 1}. {parseSlateNode(child)}</Text>
            </View>
          ))}
        </View>
      );
    }

    case 'list-item': {
      return (
        <View>
          {node.children.map((child, index) => (
            <Text key={index}>{parseSlateNode(child)}</Text>
          ))}
        </View>
      );
    }

    default: {
      if (node.text) {
        return parseSlateTextNode(node);
      }

      return null
    }
  }
};

const parseSlateEditorContent = (editorContent) => {
  return (
    <View>
      {editorContent.map((node, index) => (
        <View key={index} wrap={false}>{parseSlateNode(node)}</View>
      ))}
    </View>
  );
};

const MyDocument = ({ content }) => (
  <Document>
    <Page style={{ padding: 20, fontSize: '12' }}>
      {content}
    </Page>
  </Document>
)

Font.register({
  family: "Helvetica",
});

export const downloadPdf = async (content) => {
  const parsedContent = parseSlateEditorContent(content)
  const blob = await pdf(
    <MyDocument content={parsedContent} />
  ).toBlob();

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'sample.pdf';

  link.click();

  URL.revokeObjectURL(link.href);
}

