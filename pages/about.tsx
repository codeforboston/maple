import Image from "../components/Image"
import Twitter from "../components/Twitter/Twitter"
import democracyReform from "../public/democracyReform.png"
import faithDemocracy from "../public/faithDemocracy.png"
import privacyDemocracy from "../public/privacyDemocracy.png"
import racialJustice from "../public/racialJustice.png"
import style from "../styles/About.module.css"
import { createPage } from "../components/page"

export default createPage({
  v2: true,
  title: "About",
  Page: () => {
    return (
      <>
        <div className={style.aboutWrapper}>
          <div>
            <p>
              <b>What is the Good Governance Project [GGP]?</b>
              <br />
              <br />
              We are a non-partisan, student-driven initiative at Boston College
              Law School and the BC Clough Center for Constitutional Democracy.
              We advocate for faith in democracy, and for democratic structures
              worth of faith; inclusive, equitable and responsive. Using our
              Democracy Maps, we aggregate voices from across the state to
              advance discussion on key governance issues. We also provide legal
              support to pro-democracy organizations and legislators, and host
              events to galvanize and encourage faith in democracy.
              <br />
              <br />
              <b>The GGP Priorities</b>
              <br />
              <br />
              After studying our political institutions in the fall and winter,
              the GGP students identified three state legislative priorities to
              improve the quality of democracy in Massachusetts:
              <a href="/same-day-registration"> same day registration;</a>
              <a href="/absentee-voting"> no-excuse absentee voting; </a>
              and <a href="/campaign-finance"> publicly financed campaigns</a>.
              While there are many other legislative improvements to make to our
              democracy, which we identify{" "}
              <a href="/other-legislative-endorsements">here</a>, these three
              priorities reflect the impactful, pragmatic, and common ground
              changes the GGP hopes to advance.
            </p>

            <div className={style.posterContainer}>
              <div>
                <h3>Learn with us - click a poster to watch!</h3>
              </div>
              <div className={style.learnWithPosters}>
                <div className={style.firstPosterCol}>
                  <div className={style.posterImgLink} id="rightPoster">
                    <a
                      href="https://www.youtube.com/watch?v=XBFWFC2vtiY&t=770s"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Image
                        src={faithDemocracy}
                        className={style.posterImages}
                        alt=""
                      />
                    </a>
                  </div>
                  <div className={style.posterImgLink} id="leftPoster">
                    <a
                      href="https://www.youtube.com/watch?v=XF2IGKopwdk"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Image
                        src={democracyReform}
                        className={style.posterImages}
                        alt=""
                      />
                    </a>
                  </div>
                </div>

                <div className={style.secondPosterCol}>
                  <div className={style.posterImgLink} id="middlePoster1">
                    <a
                      href="https://www.youtube.com/watch?v=utCYTU3miOg&t=3s"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Image
                        src={racialJustice}
                        className={style.posterImages}
                        alt=""
                      />
                    </a>
                  </div>
                  <div className={style.posterImgLink} id="middlePoster2">
                    <a
                      href="https://www.youtube.com/watch?v=DLjdC8BFlvY&t=34s"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Image
                        src={privacyDemocracy}
                        className={style.posterImages}
                        alt=""
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Twitter />
        </div>

        {/* <div className={style.posterContainer}>
        <div>
          <h3>Learn with us - click a poster to watch!</h3>
        </div>
        <div className={style.learnWithPosters}>
          <div className={style.firstPosterCol}>
            <div className={style.posterImgLink} id="rightPoster">
              <a href="https://bccte.zoom.us/webinar/register/WN_e-d5HI5zQXusUC6WOsAT2w" target="_blank" rel="noreferrer">
                <Image src={faithDemocracy} className={style.posterImages} alt="" />
              </a>
            </div>
            <div className={style.posterImgLink} id="leftPoster">
              <a href="https://www.youtube.com/watch?v=XF2IGKopwdk" target="_blank" rel="noreferrer">
                <Image src={democracyReform} className={style.posterImages} alt="" />
              </a>
            </div>
          </div>

          <div className={style.secondPosterCol}>
            <div className={style.posterImgLink} id="middlePoster1">
              <a href="https://www.youtube.com/watch?v=utCYTU3miOg&t=3s" target="_blank" rel="noreferrer">
                <Image src={racialJustice} className={style.posterImages} alt="" />
              </a>
            </div>
            <div className={style.posterImgLink} id="middlePoster2">
              <a href="https://www.youtube.com/watch?v=DLjdC8BFlvY&t=34s" target="_blank" rel="noreferrer">
                <Image src={privacyDemocracy} className={style.posterImages} alt="" />
              </a>
            </div>
          </div>

        </div>
      </div> */}

        <div className={style.sharedValues}>
          <h3>GGP Statement of Shared Values</h3>
          <h4>Core values: humility, curiousity, compassion</h4>
          <ul>
            <li>
              We believe a better quality democracy can better serve the public
              interests
            </li>
            <li>
              We focus on non-partisan means of governing - not partisan ends
            </li>
            <li>
              We have a strong preference for diverse membership – including
              political diversity
            </li>
            <li>We strive to give credence to the sincerity of others</li>
            <li>We know our voice is louder in local and state politics</li>
            <li>We prefer accurate statements over absolute statements </li>
            <li>We listen generously </li>
            <li>We have a responsibility to be our authentic selves</li>
          </ul>
        </div>
        {/* </Layout> */}
      </>
    )
  }
})
