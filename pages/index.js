import React from 'react';
import NewLayout from '../components/NewLayout/NewLayout'

import PriorityCard from '../components/PriorityCard/PriorityCard'

const newHome = () => {

  // Constats to pass to PriorityCards
  const edrTitle = "Election Day Registration";
  const edrPathMap = "/election-day-registration";
  const edrPathLetter = "/edr-letter";
  const edrSubHeader = "Why should we have it?";
  const edrBlurb =
    `Currently, MA voters must register twenty days before an election 
    in order to participate. Removing this barrier, and allowing eligible 
    voters to register up to, and on, election day would allow more 
    Massachusetts voters to make their voices heard – a critical aspect 
    of a healthy democracy. Currently, twenty-two states allow EDR in some 
    form. In those states, voter turnout has increased considerably. Demos, 
    a non-partisan public policy organization found in a 2009 survey that 
    implementing EDR created “minimal” costs, as legislators merely reallocated 
    existing resources, and actually reduced the need for provisional ballots – 
    saving the time and expense of processing those ballots. Voters registering 
    on election day would still be required to provide proof of identity and 
    proof of residence, making the process of registration no different from that 
    of the current process.`;

  const emvTitle = "Early Mail & Mail Voting";
  const emvPathMap = "/early-mail-voting";
  const emvPathLetter = "/early-mail-voting-letter";
  const emvSubHeader = "Why do we need it?";
  const emvBlurb =
    `Representative democracy is stronger when more constituents participate in 
    elections, and turnout is highest when participation is made easy. 
    Massachusetts participation rates in the most recent elections indicate it 
    was a success – which stems largely from the emergency acts smartly passed 
    by the Legislature in response to COVID-19 (see St.2020 c.115 and St.2020 c.255). 
    Among the temporary changes made to our election systems was a relaxing of 
    vote-by-mail (absentee ballot) restrictions, allowing individuals from across 
    the state to vote early and by absentee ballot. 42% of registered voters in the 
    Commonwealth took advantage of the relatively easy means to vote and would likely 
    do so again if given the opportunity. Massachusetts should retain these improved 
    voting mechanisms.`;

  const cfaTitle = "Campaign Finance Amendment";
  const cfaPathMap = "/campaign-finance";
  const cfaPathLetter = "/campaign-finance-letter";
  const cfaSubHeader = "Why do we need to amend the constitution?";
  const cfaBlurb =
    `In 1998, the voters of Massachusetts overwhelmingly approved a ballot measure to 
    allow candidates who agreed to spending and donation limits access to public funds. 
    But in 2003, the legislature repealed the fair elections law as a last-minute 
    amendment to the state budget. Public funding provisions exist in the Commonwealth 
    for candidates for statewide office, but candidates for state legislature seats have 
    no such support. The data on publicly financed elections is clear. When Connecticut 
    implemented publicly financed elections, legislators were able to spend less time 
    fundraising and spend more time with constituents. More citizens became donors and 
    educated themselves about policy issues. The influence of lobbyists declined, and 
    more bipartisan, publicly supported bills were passed. The people of Massachusetts 
    deserve responsive representation in the state legislature, and adopting public 
    financing would help achieve that goal.`;



    // Actually return things
  return (
    <>

      <NewLayout pageTitle="2021 Priorities">
        <div>
          
          {/* A card for each priority, using props defined above */}
          <PriorityCard
            title={edrTitle}
            pathMap={edrPathMap}
            pathLetter={edrPathLetter}
            subHeader={edrSubHeader}
            text={edrBlurb}
          />

          <PriorityCard
            title={emvTitle}
            pathMap={emvPathMap}
            pathLetter={emvPathLetter}
            subHeader={emvSubHeader}
            text={emvBlurb}
          />

          <PriorityCard
            title={cfaTitle}
            pathMap={cfaPathMap}
            pathLetter={cfaPathLetter}
            subHeader={cfaSubHeader}
            text={cfaBlurb}
          />

          {/* <PriorityCard title="Priority 69 (nice)" /> */}
          {/* <PriorityCard title="Priority 420" /> */}
        </div>
      </NewLayout>

    </>
  );
}

export default newHome;



// import { Layout } from "../components";
// import styles from "../styles/Home.module.css";

// export default function Home() {
//   return (
//     <Layout pageTitle="The Good Governance Project">
//       <div className={styles.container}>
//       <div><a className="btn btn-primary" href="/working-new-home">To New Home</a></div>
//       <br />
//         <span className={styles["quote-wrapper"]}>
//         The Good Governance Project (GGP) advocates for faith in democracy, 
//         and for democratic structures worthy of faith. The GGP is a non-partisan,
//         student-driven initiative at Boston College, affiliated with the Clough Center for Constitutional Democracy. 
//         Learn more about us <a href="pages/about.js">here</a>. 
//         </span>
//         <br />

//         <div className={styles.flexdiv}>
//           <div className={styles.childDiv}>
//             The GGP identified <b>3 legislative priorities</b> to improve the quality of democracy in Massachusetts. 
//             <br />
//             1. <a href="pages/election-day-registration.js">Election Day Registration</a>
//           <br />
//           2. <a href="pages/early-mail-voting.js">Early/Mail (Absentee) Voting</a> 
//           <br />
//           3. <a href="pages/campaign-finance.js">Publicly Financed Campaigns</a> 
//           </div>
        
//           <div className={styles.childDiv}>
//           We seek to encourage discourse and civic engagement through our <a href="pages/advocacy-maps.js">Democracy Maps</a>
//           <br />
//           If you are a student group, professor, or business (not-profit or for-profit),
//           <br />
//           we encourage you to learn about our priorities, and submit this <a href="https://docs.google.com/forms/d/e/1FAIpQLSfhfGLP9Tjy9P49vyv-yk706pOISFH0ED8uImrlaqRRDBS8hg/viewform"> form</a>
//           <br />
//           to endorse or oppose the issues.
//           </div> 
//         </div>
//         <br />
//         <div>
//         We feature our recorded events on our <a href="https://www.youtube.com/channel/UCeLbI3hUw3fR_WgU3l1DlHg">YouTube Channel</a>. Learn more about democracy, its importance, and how we can preserve it.
//         </div>
//         <div className={styles.twitter}>
//         <a class="twitter-timeline" href="https://twitter.com/GGovernanceProj?ref_src=twsrc%5Etfw">Tweets by GGovernanceProj</a> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
//         </div>
//       </div>
//     </Layout>
//   );
// }
