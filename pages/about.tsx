import Image from "../components/Image"
// import Twitter from "../components/Twitter/Twitter"
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
            <h1>Why MAPLE?</h1>
            <p>
              By creating an accessible platform for submitting testimony on
              legislation in MA via a transparent archive of public testimony,
              we aim to achieve these goals:
            </p>
            <ul>
              <li>Increase access to the legislative process</li>
              <li>
                Engage a wider set of stakeholders and perspectives in
                policymaking
              </li>
              <li>Promote transparency in government</li>
              <li>Distribute information about pending legislation</li>
            </ul>
            <h1>Who we are</h1>
            <p>
              We are a collective of open source developers, legal scholars, and
              policy analysts & advocates seeking to make the legislative
              process in Massachusetts more accessible and transparent.
            </p>
            <p>
              MAPLE platform is a project of the{" "}
              <a href="https://www.nulawlab.org">NuLawLab</a> developed with{" "}
              <a href="https://www.codeforboston.org">Code for Boston</a>.
            </p>
            <h2>NuLawLab</h2>
            <p>
              The NuLawLab is the interdisciplinary innovation laboratory at{" "}
              <a href="https://www.northeastern.edu/law/">
                Northeastern University School of Law
              </a>
              . NuLawLab's researchers are leaders in the emerging global{" "}
              <a href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3644302">
                Legal Design movement
              </a>
              .
            </p>
            <h2>Code for Boston</h2>
            <p>
              Code for Boston addresses local social and civic challenges
              through creative uses of technology. Despite the name, they are
              not solely focused on coding! They foster relationships between
              government, nonprofit, academic, for-profit companies, residents,
              civic technologists, analysts, designers, and many more.{" "}
              <a href="https://github.com/codeforboston/advocacy-maps/graphs/contributors">
                Code for Boston's volunteer contributors
              </a>{" "}
              have led the technical implementation and development of this
              website and platform as an open source project (
              <a href="https://github.com/codeforboston/advocacy-maps">
                see our repository on GitHub
              </a>
              ).
            </p>
            <h2>Collaborating Institutions</h2>
            <p>
              The project is developed in partnership between the NuLawLab and
              scholars at{" "}
              <a href="https://www.bc.edu/bc-web/schools/law.html">
                Boston College Law School
              </a>{" "}
              and{" "}
              <a href="https://cyber.harvard.edu">
                Harvard University's Berkman Klein Center for Internet & Society
              </a>
              .
            </p>
            <h3>Boston College Law School</h3>
            <p>
              The BC Law School is an inclusive community of scholars that
              prepares students for success in the legal profession at the
              highest levels. Project co-founder Matt Victor is a JD student at
              BC.
            </p>
            <h3>Harvard Berkman Klein Center</h3>
            <p>
              The Berkman Klein Center's mission is to explore and understand
              cyberspace; to study its development, dynamics, norms, and
              standards; and to assess the need or lack thereof for laws and
              sanctions. Project co-founder{" "}
              <a href="https://cyber.harvard.edu/people/nathan-sanders">
                Nathan Sanders
              </a>{" "}
              is a past Fellow and current Affiliate at BKC.
            </p>
          </div>

          {/* <Twitter /> */}
        </div>
        {/* </Layout> */}
      </>
    )
  }
})
