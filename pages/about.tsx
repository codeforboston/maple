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
              <h1>Who we are</h1>
              <p>
              The testimony access project is a project of the <a href="https://www.nulawlab.org">NuLawLab</a> developed with <a href="https://www.codeforboston.org">Code for Boston</a>. 
              </p>
              <p>
              The NuLawLab is the interdisciplinary innovation laboratory at <a href="https://www.northeastern.edu/law/">Northeastern University School of Law</a>. NuLawLab's researchers are leaders in the emerging global Legal Design movement. 
              </p>
              <p>
              Code for Boston addresses local social and civic challenges through creative uses of technology. Despite the name, we are not solely focused on coding! They foster relationships between government, nonprofit, academic, for-profit companies, residents, civic technologists, analysts, designers, and many more. <a href="https://github.com/codeforboston/advocacy-maps/graphs/contributors">Code for Boston's volunteer contributors</a> have led the technical implementation and development of this website and platform as an open source project (<a href="https://github.com/codeforboston/advocacy-maps">see our repository on GitHub</a>).
              </p>
              <p>
              The project is developed in partnership between the NuLawLab and scholars at Boston College Law School's Good Governance Project (GGP) and <a href="https://cyber.harvard.edu">Harvard University's Berkman Klein Center for Internet & Society</a>.
              </p>
              <p>
              GGP is a non-partisan, student-driven initiative at Boston College
              Law School and the <a href="https://www.bc.edu/bc-web/centers/clough.html">BC Clough Center for Constitutional Democracy</a>.
              GGP advocates for faith in democracy, and for democratic structures
              worth of faith; inclusive, equitable and responsive. Using our
              Democracy Maps, we aggregate voices from across the state to
              advance discussion on key governance issues. GGP also provides legal
              support to pro-democracy organizations and legislators, and host
              events to galvanize and encourage faith in democracy.  Project co-founder Matt Victor is a JD student at BC and the founder of GGP.
              </p>
              <p>
              The Berkman Klein Center's mission is to explore and understand cyberspace; to study its development, dynamics, norms, and standards; and to assess the need or lack thereof for laws and sanctions. Project co-founder <a href="https://cyber.harvard.edu/people/nathan-sanders">Nathan Sanders</a> is a past Fellow and current Affiliate at BKC.
              </p>
              <h1>Project History</h1>
              <p>
              </p>
              <h1>Project Motivations</h1>
              <p>
              </p>
          </div>

          <Twitter />
        </div>

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
