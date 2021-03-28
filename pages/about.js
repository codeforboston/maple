// import { Layout } from "../components";
import NewLayout from "../components/NewLayout/NewLayout";
import Twitter from "../components/Twitter/Twitter";
import style from "../styles/About.module.css"

function About() {
  return (
    // <Layout pageTitle="About The Good Governance Project">
    <NewLayout pageTitle="About The Good Governance Project">
      <div className={style.aboutWrapper}>
      <div>
      <p>
        <b>What is the Good Governance Project [GGP]?</b>
        <br />
        <br />
        We are a non-partisan, student-driven initiative at Boston College Law
        School and the BC Clough Center for Constitutional Democracy. We
        advocate for faith in democracy, and for democratic structures worth of
        faith; inclusive, equitable and responsive. Using our Democracy Maps, we
        aggregate voices from across the state to advance discussion on key
        governance issues. We also provide legal support to pro-democracy
        organizations and legislators, and host events to galvanize and
        encourage faith in democracy.
        <br />
        <br />
        <b>The GGP Priorities</b>
        <br />
        <br />
        After studying our political institutions in the fall and winter, the
        GGP students identified three state legislative priorities to improve
        the quality of democracy in Massachusetts:
        <a class="link" href="/election-day-registration">
          {" "}
          election day registration;
        </a>
        <a class="link" href="/early-mail-voting">
          {" "}
          early voting & vote-by-mail;{" "}
        </a>
        and{" "}
        <a class="link" href="/campaign-finance">
          {" "}
          publicly financed campaigns
        </a>
        . While there are many other legislative improvements to make to our
        democracy, which we identify{" "}
        <a class="link" href="/other-legislative-endorsements">
          here
        </a>
        , these three priorities reflect the impactful, pragmatic, and common
        ground changes the GGP hopes to advance.
      </p>
      </div>
      <Twitter/>
      </div>
    {/* </Layout> */}
    </NewLayout>
  );
}

export default About;
