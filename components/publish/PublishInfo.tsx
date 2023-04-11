import styled from "styled-components"
import { Image } from "../bootstrap"

/**
 * The information panel explaining rules about publishing.
 *
 * A panel with an orange title section, a header icon, and a bulleted lsit of
 * items, using bootstrap.
 */
export const PublishInfo = styled(props => {
  const content = {
    title: "Keep Note",
    heading: "Testimony Basics",
    items: [
      "You can edit your testimony up to 5 times, but the previous versions will remain available",
      "Since MAPLE is an archive, you cannot remove your testimony from the site.",
      "Don't forget to send the email to your legislators!"
    ]
  }

  return (
    <div {...props}>
      <h2 className="title">{content.title}</h2>
      <Image className="icon" src="/computertextblob.svg" alt="" />
      <h4 className="text-center text-secondary mt-2">
        <b>{content.heading}</b>
      </h4>
      <ul className="text-secondary">
        {content.items.map((item, i) => (
          <li className="mb-2" key={i}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
})`
  background: var(--bs-body-bg);
  display: flex;
  flex-direction: column;

  height: 100%;

  .title {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 3em;
    color: white;
    background-color: var(--bs-orange);
  }

  .icon {
    width: 60%;
    align-self: center;
  }
`
