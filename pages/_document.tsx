import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript
} from "next/document"

class MapleDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    return Document.getInitialProps(ctx)
  }

  render() {
    return (
      // The redesign, on every page from the first paint: its tokens and the
      // rules built on them are scoped to this attribute
      // (styles/bootstrap.scss, styles/globals.css and the components).
      <Html lang={this.props.locale ?? "en"} data-maple-theme="dd">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MapleDocument
