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
      // Branch-local: storybook-experiment renders the app in the Digital
      // Democracy skin so changes can be judged in context. The token
      // overrides live in styles/bootstrap.scss. Remove this attribute to see
      // the current MAPLE look, or drop the line before this branch merges.
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
