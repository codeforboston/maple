import React from "react"
import UserTestimonies from "../UserTestimonies/UserTestimonies"
import { useAuth } from "../../components/auth"

const MyTestimonies = () => {
  const { user } = useAuth()
  const userUid = user ? user.uid : null
  return <UserTestimonies authorId={userUid} />
}

export default MyTestimonies
