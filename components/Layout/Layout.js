import Head from "next/head";
import { NavBar } from "../index";
import styles from "./Layout.module.css";

// Outer HTML for single- or multi-column layouts
export const LayoutWrapper = function({
  pageTitle,
  children,
  title
}) {
  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <NavBar pageTitle={pageTitle}></NavBar>
      <div className={styles["content-container"]}>
        {children}
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerinfo}>
          <div>Subscribe to our <a href="https://docs.google.com/forms/d/e/1FAIpQLSdXHbMqo299lCBiR_rgxSuxd5-DgEiWNpDAFjawLh66263YLw/viewform"> newsletter</a></div>
          <div>Powered by Democracy</div>
          <div>Contact Us <a href="mailto: GGP.BCLaw@gmail.com"> GGP.BCLaw@gmail.com</a></div>
        </div>
      </footer>
    </div>
  );
}

// The default layout is single-column and its content
// gets wrapped in a <section> which has a white background
export default function Layout({
  pageTitle,
  children,
  title = "Easy To Do Good",
}) {
  return (
    <LayoutWrapper
      pageTitle={pageTitle}
      title={title}
      >
      <section className={styles["content-article"]}>{children}</section>
    </LayoutWrapper>
  );
}
