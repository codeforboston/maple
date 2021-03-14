import { Layout } from "../components";

function Disclaimer() {
  return (
    <Layout pageTitle="Democracy Maps Disclaimer">
      <p>
	The legislative information displayed on our Democracy Maps does not,
	and cannot, reflect a wholly accurate picture of the individual and
	collective legislators. <u>We urge you to contact your legislator to learn
	more about their views and voting history on these issues</u>. Legislators
	vote for or against bills and amendments for a variety of reasons - not
	solely due to their approval or disapproval for the measure at hand.
	Sometimes legislators vote against an amendment on a bill, despite their
	actual approval of the amendment, because they know that the bill is less
	likely to pass if it includes that amendment. Or they may be voting against
	something because it does not go far enough. Other times, like within our
	federal legislature, legislators are asked by leadership to act in sync
	with the party.
        <br />
        <br />
        <u>A substantial limitation</u> is the fact that many of our legislators’ votes
	are not publicly available. No Joint Committees are required to publish
	the details of their votes, including the Joint Committee on Elections -
	which is the first step for all election-related legislation. We have 
	compiled all the votes and co-sponsorships information that are on record.
	While The GGP believes that committee votes should be fully published, there
	are many (including the vast majority of our House of Representatives) who 
	feel otherwise. You can decide for yourself, as the Rules were publicly debated
	on 2/24/21 (video <a href="https://malegislature.gov/Events/Sessions/Detail/3864">here</a>,
	debate starts at 27:00). You can also have far greater access to legislature
	information by purchasing <a href="https://instatrac.com/">InstaTrac</a> - a
	proprietary legislative tracking software. However, the product is intended
	for professional use and a yearly subscription costs several thousand dollars.
        <br />
        <br />
        The legislative process is confusing. There are many paths through which a
	bill may become a law. Getting accurate information into this process is 
	difficult in many states. In Massachusetts, our legislative process is 
	especially opaque. Through The Good Governance Project 2021 initiative, 
	<a href="/transparency-ma">Transparency in MA</a>, our students will conduct a 50-state
	comparative study, and identify best practices for transparency and the
	use of technology within state governments.
      </p>
    </Layout>
  );
}

export default Disclaimer;
