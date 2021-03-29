// import { PriorityPageLayout } from "../components";
import NewLayoutPriorityPage from "../components/NewLayoutPriorityPage/NewLayoutPriorityPage";
import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic(() => import("../components/Map/Map.jsx"), {
  ssr: false,
});
/* URL via EMV Data > File > Publish to the web > Link > Sheet1 > CSV > Publish */
const EMV_LEGISLATOR_DATA_LINK =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRiMO006znF3HZe1PW_eC9KyBTTHVvkDXu5FIiErLUbyeY-qtxN8AiKGGGq3eY5ka15PNwhR7iffLxD/pub?gid=0&single=true&output=csv";
/* URL via Third Party Data > File > Publish to the web > Link > EMV > CSV > Publish */
const EMV_THIRD_PARTY_DATA =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLgy3yjC9PKH0YZl6AgDfR0ww3WJYzs-n9sUV9A5imHSVZmt83v_SMYVkZkj6RGnpzd9flNkJ9YNy2/pub?gid=791972090&single=true&output=csv";

const EMV_FURTHER_READING = (
  <ul>
    <li>
      Healthy Elections Project:{" "}
      <a href="https://healthyelections.org/research-vote-mail">
        Research on Vote-By-Mail
      </a>
    </li>
    <li>
      MIT Election Lab:{" "}
      <a href="https://electionlab.mit.edu/research/voting-mail-and-absentee-voting">
        Voting by mail and absentee voting
      </a>
    </li>
    <li>
      Stanford News:{" "}
      <a href="https://news.stanford.edu/2020/09/03/examining-effects-challenges-mail-in-voting/">
        Examining Effects and Challenges to Mail-in Voting
      </a>
    </li>
    <li>
      UChicago News:{" "}
      <a href="https://news.uchicago.edu/story/does-voting-mail-increase-risk-voter-fraud">
        Why fears about voting by mail are unfounded
      </a>
    </li>
    <li>
      Brookings:{" "}
      <a href="https://www.brookings.edu/policy2020/votervital/how-does-vote-by-mail-work-and-does-it-increase-election-fraud/">
        How does vote-by-mail work and does it increase election fraud?
      </a>
    </li>
    <li>
      Brennan Center:{" "}
      <a href="https://www.brennancenter.org/our-work/research-reports/why-vote-mail-option-necessary">
        Why a vote-by-mail option is necessary
      </a>
    </li>
  </ul>
);
const DISCLAIMER_TEXT = "Why Should We Have Early Mail & Mail Voting?";

function EarlyMailVoting() {
  return (
    <NewLayoutPriorityPage
      pageTitle="No-Excuse Absentee Voting"
      legislator_data={EMV_LEGISLATOR_DATA_LINK}
      third_party_data={EMV_THIRD_PARTY_DATA}
      further_reading={EMV_FURTHER_READING}
      disclaimerText={DISCLAIMER_TEXT}
      letterLink="/early-mail-voting-letter"
    >
      <p>
        <b>
          Why do we need No-Excuse Absentee Voting?
        </b>
        <br />
        Representative democracy is stronger when more constituents participate
        in elections, and turnout is highest when participation is made easy.
        Massachusetts participation rates in the most recent elections indicate
        it was a success – which stems largely from the emergency acts smartly
        passed by the Legislature in response to COVID-19 (see
        <a href="https://malegislature.gov/Laws/SessionLaws/Acts/2020/Chapter115">
          {" "}
          St.2020 c.115{" "}
        </a>
        and{" "}
        <a href="https://malegislature.gov/Laws/SessionLaws/Acts/2020/Chapter255">
          {" "}
          St.2020 c.255
        </a>
        ). Among the temporary changes made to our election systems was a
        relaxing of vote-by-mail (absentee ballot) restrictions, allowing
        individuals from across the state to vote early and by absentee ballot.
        <a href="https://www.bostonherald.com/2020/11/20/mail-in-ballots-made-up-42-of-massachusetts-votes-cast-in-november-election/">
          {" "}
          42% of registered voters in the Commonwealth took advantage of the
          relatively easy means to vote{" "}
        </a>{" "}
        and would likely do so again if given the opportunity. Massachusetts
        should retain these improved voting mechanisms.
        <br />
        You can read our full letter on this issue,{" "}
        <a href="/early-mail-voting-letter">here</a>.
        <br />
        <b>Democracy Map</b>
      </p>
    </NewLayoutPriorityPage>
  );
}

export default EarlyMailVoting;
