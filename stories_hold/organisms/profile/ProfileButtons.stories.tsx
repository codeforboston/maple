import { createMeta } from "stories/utils"
import { ComponentStory } from "@storybook/react"
import {
  StyledButton,
  EditProfileButton
} from "components/ProfilePage/ProfileButtons"
import { wrapper } from "components/store"
import { Provider as Redux } from "react-redux"
import { Providers } from "components/providers"
import { Button, Col, Row, Stack } from "react-bootstrap"

// @TODO: [next] clean up display of these buttons
// @TODO: [later] refactor this component to use the shared project buttons [refactor phase]

// export default createMeta({
//   title: "Organisms/Profile/ProfileButtons",
//   component: MakePublicButton,
//   decorators: [
//     (Story, ...rest) => {
//       const { store, props } = wrapper.useWrappedStore(...rest)

//       return (
//         <Redux store={store}>
//           <Providers>
//             <Row>
//               <Col className="col-4">
//                 <Story />
//               </Col>
//             </Row>
//           </Providers>
//         </Redux>
//       )
//     }
//   ]
// })

export const Primary = () => <div>TODO</div>

// export const Primary = Template.bind({})

// Primary.args = {
//   isProfilePublic: true,
//   onProfilePublicityChanged: () => {
//     console.log("clicked")
//   }
// }
// Primary.storyName = "ProfileButtons"

// export const Buttons = () => (
//   <Stack className="gap-2">
//     <EditProfileButton />
//     <StyledButton>StyledButton1</StyledButton>
//     <StyledButton2>StyledButton2</StyledButton2>
//     <Button variant="primary">Primary Button</Button>
//     <Button variant="secondary">Secondary Button</Button>
//   </Stack>
// )
