// import { PriorityPageLayout } from "../components";
// import NewLayout from '../components/NewLayout/NewLayout'
import NewPriorityLayout from "../components/NewLayoutPriorityPage/NewLayoutPriorityPage";

/* URL via EDR Data > File > Publish to the web > Link > Sheet1 > CSV > Publish */
const EDR_LEGISLATOR_DATA_LINK =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRe608XwzuZhMlOP6GKU5ny1Kz-rlGFUhwZmhZwAZGbbAWOHlP01-S3MFD9dlerPEqjynsUbeQmBl-E/pub?gid=0&single=true&output=csv";
/* URL via Third Party Data > File > Publish to the web > Link > EDR > CSV > Publish */
const EDR_THIRD_PARTY_DATA_LINK =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLgy3yjC9PKH0YZl6AgDfR0ww3WJYzs-n9sUV9A5imHSVZmt83v_SMYVkZkj6RGnpzd9flNkJ9YNy2/pub?output=csv";

const EDR_FURTHER_READING = (
  <ul>
    <li>
      University of Wisconsin:
      <a href="https://www.pewtrusts.org/~/media/legacy/uploadedfiles/pcs_assets/2009/uwisconsin1pdf.pdf">
        <i>
          The Effects and Costs of Early Voting, Election Day Registration, and
          Same Day Registration in the 2008 Elections
        </i>{" "}
        [PDF]
      </a>
    </li>
    <li>
      Demos:{" "}
      <a href="https://www.demos.org/sites/default/files/publications/SameDayRegistration-2015.pdf">
        Same Day Registration [PDF]
      </a>
    </li>
    <li>
      WGBH:{" "}
      <a href="https://www.wgbh.org/news/politics/2020/01/28/same-day-voter-registration-bill-could-boost-turnout-in-mass-by-100-000">
        “Same Day Voter Registration Could Boost Turnout in Mass. by 100,000,
        Advocates Say”
      </a>{" "}
      (January 28, 2020)
    </li>
    <li>
      MassVOTE:{" "}
      <a href="https://www.massvote.org/election-day-registration">
        Same Day Registration
      </a>
    </li>
    <li>
      National Conference of State Legislatures:{" "}
      <a href="https://www.ncsl.org/research/elections-and-campaigns/same-day-registration.aspx#HowSDRWorks">
        Same-Day Voter Registration
      </a>
    </li>
  </ul>
);

function ElectionDayRegistration() {
  return (
    <NewPriorityLayout
        pageTitle="Same Day Registration"
        legislator_data={EDR_LEGISLATOR_DATA_LINK}
        third_party_data={EDR_THIRD_PARTY_DATA_LINK}
        further_reading={EDR_FURTHER_READING}
    >
      <p>
        <b>Why should we have Election Day Registration?</b>
        <br />
        Currently, MA voters must register twenty days before an election in
        order to participate. Removing this barrier, and allowing eligible
        voters to register up to, and on, election day would allow more
        Massachusetts voters to make their voices heard – a critical aspect of a
        healthy democracy. Currently, twenty-two states allow EDR in some form.
        In those states, voter
        <a href="https://www.yalelawjournal.org/forum/election-day-registration-and-the-limits-of-litigation">
          {" "}
          turnout has increased considerably
        </a>
        . Demos, a non-partisan public policy organization{" "}
        <a href="https://www.demos.org/research/what-same-day-registration-where-it-available">
          {" "}
          found in a 2009 survey{" "}
        </a>{" "}
        that implementing EDR created “minimal” costs, as legislators merely
        reallocated existing resources, and actually reduced the need for
        provisional ballots – saving the time and expense of processing those
        ballots. Voters registering on election day would still be required to
        provide proof of identity and proof of residence, making the process of
        registration no different from that of the current process.You can read
        our full letter on this issue, <a href="/edr-letter">here</a>.
        <br />
        <b>Advocacy Map</b>
      </p>
    </NewPriorityLayout>
  );
}

export default ElectionDayRegistration;
