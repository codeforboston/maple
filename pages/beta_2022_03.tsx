import { createPage } from "../components/page"
import stateHouse from "../public/ma_state_house.jpg"

export default createPage({
  v2: true,
  title: "April 2022 Beta Test",
  Page: () => {
    return (
      <>
        <h1>Participate in the MAPLE Project Beta Test</h1>
        <img
          src={stateHouse.src}
          height={300}
          className="d-print-none d-block mx-auto mb-2"
          alt="Photo of the Massachusetts State House building."
        />
        Help us make the policymaking process in Massachusetts more accessible
        and transparent! We are looking for beta testers to share feedback on
        our beta version of the Massachusetts Platform for Legislative
        Engagement (MAPLE) platform so that we can make it as useful as possible
        to the Commonwealth.
        <h2>When is the beta testing period?</h2>
        The beta testing period runs <b>April 11-22, 2022</b>. We also welcome
        feedback before or after that time!
        <h2>Who can help?</h2>
        Pretty much anyone who cares about public policy in Massachusetts! We
        are seeking a small group of beta testers with diverse interests,
        backgrounds, and experience levels. We would like to have representation
        among community advocates and activists, lobbyists, legislative staff,
        and anyone else who interacts with (or would like to start interacting
        with!) the legislative process.
        <h2>What you'll do</h2>
        The beta testing process should take about 30-60 min of your time and
        can be done anytime during the beta testing period - it's a very small,
        flexible commitment. Beta testers will be asked to perform a small
        number of essential tasks on the beta version of the MAPLE platform
        related to viewing information about bills and submitting and accessing
        written testimony. We will use an online form to collect your feedback
        about these interactions and may ask to do a brief Zoom interview to
        hear more about your experience.
        <h2>Getting Started</h2>
        To get involved in the public beta, please email project co-lead Nathan
        Sanders at{" "}
        <a href="mailto:nsanders@cyber.harvard.edu">
          nsanders@cyber.harvard.edu
        </a>
        .<h2>Who are we?</h2>
        We are a collective of open source developers, legal scholars, and
        policy analysts & advocates seeking to make the legislative process in
        Massachusetts more accessible and transparent. The Massachusetts Archive
        of Transparent Testimony platform is a project of the{" "}
        <a href="https://www.nulawlab.org/">
          NuLawLab at Northeastern Unviersity
        </a>{" "}
        developed with{" "}
        <a href="https://www.codeforboston.org/">Code for Boston</a> together
        with collaborating groups at Boston College and Harvard University.
        MAPLE is being developed as a public good and is, and will always
        remain, open to access and free to use.
      </>
    )
  }
})
