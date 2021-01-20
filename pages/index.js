import { Layout } from "../components";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <Layout pageTitle="The Good Governance Project">
      <div className={styles.container}>
        <span className={styles["quote-wrapper"]}>
          We find <b>common ground</b> in the desire to improve the quality of
          our democracy. Our political systems should be inclusive, transparent
          and responsive.
        </span>
        <br />
        We are a group of students at Boston College Law School dedicated to
        studying democracy, and promoting it’s preservation and expansion. We
        advocate for faith in democracy, and for democratic structures worthy of
        faith.
        <br />
        <br />
        <div className={styles.priorities}>
          <b>Our 2021 Priorities</b>
          <ul>
            <li>H3033 – Election Day Registration</li>
            <li>H4603 – Campaign Finance – Constitutional Amendment</li>
            <li>H5055 – Political Advertisement Disclosure</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
