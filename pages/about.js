// import { Layout } from "../components";
import NewLayout from "../components/NewLayout/NewLayout";
import Twitter from "../components/Twitter/Twitter";
import style from "../styles/About.module.css"
import democracyReform from "../public/democracyReform.png"
import privacyDemocracy from "../public/privacyDemocracy.png"
import racialJustice from "../public/racialJustice.png"

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

      <div className={style.posterContainer}>
        <div>
          <h3>Learn with us - click a poster to watch!</h3>
        </div>
        <div className={style.learnWithPosters}>
          <div className="posterImgLink" id="leftPoster">
            <a href="https://www.youtube.com/watch?v=XF2IGKopwdk" target="_blank" rel="noreferrer">
              <img src={democracyReform} className={style.posterImages} alt="" />
            </a>
          </div>
          <div className="posterImgLink" id="middlePoster">
            <a href="https://www.youtube.com/watch?v=utCYTU3miOg&t=3s" target="_blank" rel="noreferrer">
              <img src={racialJustice} className={style.posterImages} alt="" />
            </a>
          </div>
          <div className="posterImgLink" id="rightPoster">
            <a href="https://www.youtube.com/watch?v=DLjdC8BFlvY&t=34s" target="_blank" rel="noreferrer">
              <img src={privacyDemocracy} className={style.posterImages} alt="" />
            </a>
          </div>
        </div>
      </div>

      <div className={style.sharedValues}>
        <h3>GGP Statement of Shared Values</h3>
        <h4>Core values: humility, curiousity, compassion</h4>
        <ul>
          <li>We believe a better quality democracy can better serve the public interests</li>
          <li>We focus on non-partisan means of governing - not partisan ends</li>
          <li>We have a strong preference for diverse membership – including political diversity</li>
          <li>We strive to give credence to the sincerity of others</li>
          <li>We know our voice is louder in local and state politics</li>
          <li>We prefer accurate statements over absolute statements </li>
          <li>We listen generously </li>
          <li>We have a responsibility to be our authentic selves</li>
        </ul>
      </div>
    {/* </Layout> */}
    </NewLayout>
  );
}

export default About;
