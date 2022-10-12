import { useState } from "react"
import { Form } from "react-bootstrap"
import { Image } from 'components/bootstrap'
import { createMeta } from "stories/utils"
import styles from './UserTestimonyListCard.module.css'
import { ComponentStory } from "@storybook/react"
import { TestimonySearchRecord } from 'functions/src/testimony/types'

interface TestimoniesData {
  testimony: TestimonySearchRecord
  billTitle: string
}

const testimoniesData: TestimoniesData[] = [
  {
    testimony: {
      id: 'SzrKqGzQdy0Pjb8wyAz7',
      billId: "H.3340",
      content: `Representative democracy requires political participation, but, as our history has taught us and as we have observed in recent elections, our political system alone does not guarantee an active citizenry or their equal access to the ballot. We must continually strive to improve our electoral systems and work towards full 
      civic participation. This bill ("The VOTES Act") modernizes Massachusetts' democracy with the low-cost, high impact electoral practices that dozens of our sister states have utilized for years.  The VOTES ACT includes same day registration, vote-by-mail, expanded early voting, expands ballot access for incarcerated people, and other importance reforms. 
      For example, high turnout in MA for the 2020 election stems largely from the emergency acts smartly passed by the Legislature in response to COVID-19. Among the temporary changes made to our election systems was a relaxing of vote-by-mail (absentee ballot) restrictions, allowing individuals from across the state to vote early and by absentee ballot. 42% of registered voters in the `,
      position: "endorse",
      publishedAt: 1665250518,
      court: 1, 
      authorUid: '2', 
      authorDisplayName: 'Test user 2', 
      version: 1
    },
    billTitle: 'An Act creating a green bank to promote clean energy in Massachusetts'
  },
  {
    testimony: {
      id: 'SzrKqGzQdy0Pjb8wyAz7',
      billId: "H.3292",
      content: `Representative democracy requires political participation, but, as our history has taught us and as we have observed in recent elections, our political system alone does not guarantee an active citizenry or their equal access to the ballot. We must continually strive to improve our electoral systems and work towards full 
      civic participation. This bill ("The VOTES Act") modernizes Massachusetts' democracy with the low-cost, high impact electoral practices that dozens of our sister states have utilized for years.  The VOTES ACT includes same day registration, vote-by-mail, expanded early voting, expands ballot access for incarcerated people, and other importance reforms. 
      For example, high turnout in MA for the 2020 election stems largely from the emergency acts smartly passed by the Legislature in response to COVID-19. Among the temporary changes made to our election systems was a relaxing of vote-by-mail (absentee ballot) restrictions, allowing individuals from across the state to vote early and by absentee ballot. 42% of registered voters in the `,
      position: "oppose",
      publishedAt: 1665250518,
      court: 1, 
      authorUid: '1', 
      authorDisplayName: 'Test user', 
      version: 1
    },
    billTitle: 'An Act achieving a green future with infrastructure and workforce investments'
  }
]

// TODO: move into components directory
const UserTestimonyCard = ({ testimony, billTitle }: { testimony: TestimonySearchRecord, billTitle: string}) => {
  const [showMore, setShowMore] = useState<boolean>(false)

  const published = new Date(testimony.publishedAt * 1000).toLocaleDateString()
  const positionTransform: any = {
    endorse: {
      color: "green",
    },
    oppose: {
      transform: "scaleY(-1) rotate(-1turn)",
    },
    neutral: {
      transform: "scaleY(-1) rotate(-0.5turn)",
    },
  }

  const positionStyle: { color?: string, transform?: string } = positionTransform[testimony.position as string]

  return (
    <div className="border-1 border-bottom border-dark px-3 py-2 d-flex flex-column">
      <div className="d-flex align-items-center">
        <span className="fs-2 pe-2">{testimony.billId}</span>
        <Image
          alt=""
          src="thumbs-up.svg"
          height={30}
          style={positionStyle}
        />
      </div>
      <div className="d-flex justify-content-between pb-3">
        <span className={styles.testimony_card_title}>{billTitle}</span>
        <span><b>{published}</b></span>
      </div>

      {showMore ? (
        <div className="pb-3">{testimony.content}</div>
      ) : (
        <>
          <div className={styles.testimony_card_content}>{testimony.content.substring(0, 600)}</div>
          <div className="py-2 align-self-end">
            <span onClick={() => setShowMore(true)}>Show More</span>
          </div>
        </>
      )}
    </div>
  )
}

const UserTestimonyListCard = ({
  testimoniesData,
  perPage,
  pageNumber,
  total
}: { 
  testimoniesData: any[],
  perPage: number,
  pageNumber: number,
  total: number
}) => {
  const visible = perPage === 1 ? pageNumber : `${pageNumber * perPage - perPage + 1} - ${Math.min(pageNumber * perPage, total)}`

  return (
    <div className="bg-white">
      <section className={styles.header}>
        <p className={styles.header_title}>Our Testimonies</p>
      </section>

      <section className={styles.filters}>
        <p>Showing {visible} of {total} Testimonies</p>
        <Form.Select
          className="bg-white w-auto"
        >
          <option value="Most Recent">Most Recent</option>
          <option value="Oldest First">Oldest First</option>
        </Form.Select>
      </section>
      
      {testimoniesData.map(data => <UserTestimonyCard testimony={data.testimony} key={data.testimony.id} billTitle={data.billTitle} />)}
      <p className="text-center p-2">See More</p>
    </div>
  )
}

export default createMeta({
  title: "Profile/UserTestimonyListCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=311%3A10561",
  component: UserTestimonyListCard
})

const Template: ComponentStory<typeof UserTestimonyListCard> = ({
  testimoniesData,
  perPage,
  pageNumber,
  total
}) => {
  return (
    <UserTestimonyListCard
      testimoniesData={testimoniesData}
      perPage={perPage}
      pageNumber={pageNumber}
      total={total}
    />
  )
}

export const Primary = Template.bind({})
Primary.args = {
  testimoniesData,
  perPage: 2,
  pageNumber: 1,
  total: 9
}
