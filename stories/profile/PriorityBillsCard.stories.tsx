import React from "react";
import { createMeta } from "stories/utils";
import {PriorityBillsCard} from "../../components/PriortyBillsCard/PriorityBillsCard";

//const PriorityBillsCard = () => <div>TODO</div>

export default createMeta({
  title: "Profile/PriorityBillsCard",
  figmaUrl:
    "https://www.figma.com/file/3ifz37EOwDfmnEG8320KlD/CS1---MAPLE?node-id=109%3A2927",
  component: PriorityBillsCard
})
// const args = {
//   id: '123',
//   title: '123-UH',
//   description: "My baby don't mess around because she loves me so and this I know fo sho (uh) but does she really wanna but can't stand to see me walk out the door? (Ah)",
// }

const Template = args => <PriorityBillsCard {...args}/>

export const Primary = Template.bind({})
Primary.args = {
  id:"123", 
  title:"hc 223", 
  description:"An act that will which would have wonder with have done wrought it so orth here we go!", 
  color:"white", 
  backgroundColor:"navy", 
  width:"600px",
  height: "100px", 
  borderRadius:"0px 0px 0px 0px",} 

  export const Tail = Template.bind({})
Tail.args = {
  id:"123", 
  title:"hc 223", 
  description:"An act that will which would have wonder with have done wrought it so orth here we go!", 
  color:"white", 
  backgroundColor:"navy", 
  width:"600px",
  height: "100px", 
  borderRadius:"0px 0px 15px 15px",} 

  export const PrimarySelected = Template.bind({})
PrimarySelected.args = {
  id:"123", 
  title:"hc 223", 
  description:"An act that will which would have wonder with have done wrought it so orth here we go!", 
  color:"black", 
  backgroundColor:"white",
  width:"600px",
  height: "100px", 
  borderRadius:"0px 0px 0px 0px",} 

  export const TailSelected = Template.bind({})
TailSelected.args = {
  id:"123", 
  title:"hc 223", 
  description:"An act that will which would have wonder with have done wrought it so orth here we go!", 
  color:"black", 
  backgroundColor:"white", 
  width:"600px",
  height: "100px", 
  borderRadius:"0px 0px 15px 15px",} 
  


