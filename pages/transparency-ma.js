// import { Layout } from "../components";
import NewLayout from "../components/NewLayout/NewLayout";


function TransparencyInMA() {
  return (
    <NewLayout pageTitle="Transparency in MA">
      <div className="transparency-in-ma">
        <div className="transparency-project">
          <b>The Project:</b>
          <p Style="text-indent:1cm">
            There are a multitude of procedural changes that would make the Massachusetts electorate more informed and engaged with the
            law-making process. There are a variety of technology changes that could be employed on the state's website to achieve a similar
            end. As with most changes, each has benefits and drawbacks. The Good Governance Project intends to do a state-by-state comparative
            study on: 1) transparency and accountability rules; and 2) how technology is leveraged to inform constituents. We hope to identify
            best practices that balance the practicalities of legislating with the democratic imperative of an informed electorate.
          </p>
        </div>
        <div className="issue-solution-box">
          <div className="transparency-issue">
            <b>The Issue:</b>
            <p Style="text-indent:1cm">
              Most observers agree that a fundamental component of a successful democracy is an informed electorate. Indeed, our state constitution
              explicitly guarantees the exclusive right of governance of the people, to the people. State legislators – senators or representatives –
              do just that. They represent constituents. Constituents need a mechanism to ensure their elected officials are faithfully executing that
              duty; a way to monitor what legislators are doing on their behalf – most importantly, how they are voting (or not voting).
              In Massachusetts much of that information<a href="https://www.bostonglobe.com/2021/01/19/opinion/its-time-lawmakers-support-an-open-house/"> is kept hidden from the public</a>.
              The Good Governance Project believes that providing constituents with more information and more opportunities to meaningfully interact
              with our government allows us to better fulfil our civic responsibilities.
            </p>
            <p Style="text-indent:1cm">
              As law students, we spend countless hours reading judicial opinions that say, "I don't like this law – but if constituents disagree, they
              can vote out the legislators who passed it." That concept, rational basis review, is a cornerstone of our judicial system, and a necessary
              condition of its viability is an informed electorate. The courts often defer to the legislatures, saying, "we trust the legislators," but
              our legislative system often appears to say, "we don’t trust our constituents." Consequently, the lifeblood of democracy – transparency
              and accountability – is inhibited.
            </p>
          </div>
          <div className="transparency-solution">
            <b>The Solution:</b>
            <p Style="text-indent:1cm">
              For centuries, the accountability mechanism faced numerous technical and cost barriers. How can we quickly provide the results of votes?
              How can we do so in a cost-efficient manner for millions of constituents? Those questions are mere relics of history. Digital
              technology – the greatest conduit for information distribution in human history – provides this mechanism. The ability to access
              and understand information has never been cheaper and the electorate is increasingly capable of finding and using such information online.
            </p>
            <p Style="text-indent:1cm">
              Using technology to provide critical information to constituents is not only the politically responsible course, but will also facilitate
              more meaningful interactions between constituents and legislators, and generally improve the quality of public discourse. Technology,
              for all its benefits, has helped disrupt the traditional gatekeeping of information distribution, elevating the voices of fame-seekers,
              bad actors and those solely motivated by "clicks" and profit. In this environment, there must be greater emphasis on disclosing critical,
              unquestionable facts – such as votes and testimony.
            </p>
            <p Style="text-indent:1cm">
              Massachusetts is an international technology and educational hub. We can leverage the state's incredible resources to create a more informed
              electorate, and a more responsive and accountable democracy.
            </p>
          </div>
        </div>
        <div className="transparency-background">
          <b>Background:</b>
          <p Style="text-indent:1cm">
            In most states, there are two key circumstances under which government must provide information to the public. Otherwise, the government itself
            gets to decide which information to provide, and how to provide it. First, almost all states have public records legislation, often referred
            to as Freedom of Information Acts (FOIA's). These require elected officials to release certain information when it is requested by citizens,
            the press, businesses, and others entities.  Massachusetts is one of four states that do not subject their legislatures to public records laws,
            and is the only state with such exemptions for its judicial, legislative and executive branches.
          </p>
          <p Style="text-indent:1cm">
            Second, the legislature may choose to create rules that mandate the publication of its members’ votes. In Massachusetts, the vast majority of
            bills must be approved by two joint committees to become law, however the rules do not require joint committees to publish their votes – and
            most, if not all, joint committees do not choose to do so. There is a myriad of other potential rules that could help inform the electorate
            on votes, pending bills, amendments, and generally provide more opportunity to become informed and meaningfully engage with our government.
          </p>
        </div>
      </div>
    </NewLayout>
  );
}

export default TransparencyInMA;
