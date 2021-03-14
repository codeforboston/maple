import { Layout } from "../components";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <Layout pageTitle="The Good Governance Project">
      <div className={styles.container}>
        <span className={styles["quote-wrapper"]}>
        The Good Governance Project (GGP) advocates for faith in democracy, 
        and for democratic structures worthy of faith. The GGP is a non-partisan,
         student-driven initiative at Boston College, affiliated with the Clough Center for Constitutional Democracy. 
         Learn more about us <a href="pages/about.js">here</a>. 
        </span>
        <br />
        <div>
          The GGP identified <b>3 legislative priorities</b> to improve the quality of democracy in Massachusetts. 
          <br />
          1. <a href="pages/election-day-registration.js">Election Day Registration</a>
          <br />
          2. <a href="pages/early-mail-voting.js">Early/Mail (Absentee) Voting</a> 
          <br />
          3. <a href="pages/campaign-finance.js">Publicly Financed Campaigns</a> 
        </div>
        <br />
        <div>
          We seek to encourage discourse and civic engagement through our <a href="pages/advocacy-maps.js">Democracy Maps</a>
        <br />
          If you are a student group, professor, or business (not-profit or for-profit),
        <br />
          we encourage you to learn about our priorities, and submit this <a href="https://docs.google.com/forms/d/e/1FAIpQLSfhfGLP9Tjy9P49vyv-yk706pOISFH0ED8uImrlaqRRDBS8hg/viewform"> form</a>
        <br />
          to endorse or oppose the issues.
        </div> 
        <br />
        <div>
        We feature our recorded events on our <a href="https://www.youtube.com/channel/UCeLbI3hUw3fR_WgU3l1DlHg">YouTube Channel</a>. Learn more about democracy, its importance, and how we can preserve it.
        </div>
        <div className="twitter-timeline">
        {/* <a class="twitter-timeline" href="https://twitter.com/GGovernanceProj?ref_src=twsrc%5Etfw">Tweets by GGovernanceProj</a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> */}

        </div>
      </div>
    </Layout>
  );
}
