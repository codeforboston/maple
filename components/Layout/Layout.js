import Head from "next/head";
import { NavBar } from "../index";
import styles from "./Layout.module.css";

export default function Layout({
  pageTitle,
  children,
  title = "Easy To Do Good",
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
        <section className={styles.content}>{children}</section>
      </div>

      <footer className={styles.footer}>Powered by Democracy</footer>
    </div>
  );
}
