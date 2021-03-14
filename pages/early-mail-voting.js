import { PriorityPageLayout } from "../components";
import dynamic from "next/dynamic";

const MapWithNoSSR = dynamic(() => import("../components/Map/Map.jsx"), {
  ssr: false,
});
/* URL via EMV Data > File > Publish to the web > Link > Sheet1 > CSV > Publish */
const EMV_LEGISLATOR_DATA_LINK = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRiMO006znF3HZe1PW_eC9KyBTTHVvkDXu5FIiErLUbyeY-qtxN8AiKGGGq3eY5ka15PNwhR7iffLxD/pub?gid=0&single=true&output=csv";
/* URL via Third Party Data > File > Publish to the web > Link > EMV > CSV > Publish */
const EMV_THIRD_PARTY_DATA = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLgy3yjC9PKH0YZl6AgDfR0ww3WJYzs-n9sUV9A5imHSVZmt83v_SMYVkZkj6RGnpzd9flNkJ9YNy2/pub?gid=791972090&single=true&output=csv";

function EarlyMailVoting() {
  return (
    <PriorityPageLayout
      pageTitle="Early/Mail (Absentee) Voting"
      legislator_data={EMV_LEGISLATOR_DATA_LINK}
      third_party_data={EMV_THIRD_PARTY_DATA}
    >
      <p>
        <b>
          Why do we need Early/ Mail Voting?
        </b>
        <br />
        Representative democracy is stronger when more constituents participate in
        elections, and turnout is highest when participation is made easy.
        Massachusetts participation rates in the most recent elections indicate it was
        a success – which stems largely from the emergency acts smartly passed by the
        Legislature in response to COVID-19 (see
        <a href="https://malegislature.gov/Laws/SessionLaws/Acts/2020/Chapter115"> St.2020 c.115 </a>
        and <a href="https://malegislature.gov/Laws/SessionLaws/Acts/2020/Chapter255"> St.2020 c.255</a>).
        Among the temporary changes made to our election systems was a relaxing of
        vote-by-mail (absentee ballot) restrictions, allowing individuals from across
        the state to vote early and by absentee ballot.
        <a href="https://www.bostonherald.com/2020/11/20/mail-in-ballots-made-up-42-of-massachusetts-votes-cast-in-november-election/"> 42% of registered voters in the
        Commonwealth took advantage of the relatively easy means to vote </a> and would likely
        do so again if given the opportunity. Massachusetts should retain these improved
        voting mechanisms.
        <br />
        You can read our full letter on this issue, <a href="/early-mail-voting-letter">here</a>.
        <br />
        <b>Advocacy Map</b>
      </p>
    </PriorityPageLayout>
  );
}

export default EarlyMailVoting;
