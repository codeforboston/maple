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
      // Branch-local: set to "dd" to render the app in the Digital Democracy
      // skin so changes can be judged in context, or "maple" for the current
      // look. The token overrides live in styles/bootstrap.scss. Drop the
      // attribute before this branch merges.
      <Html lang={this.props.locale ?? "en"} data-maple-theme="maple">
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
