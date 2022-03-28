import React from "react"
import { usePublicProfile } from "../db"

const PublicProfile = ({ id }) => {
  const x = usePublicProfile(id)
  const user = x.result // result is undefined if loading, error, or it doesn't exist
  const loading = x.loading
  const error = x.error

  console.log(x)
  console.log(loading ? "loading.." : error ? "error loading" : user)

  return (
    <>
      <h1>Bob Testimonygiver</h1>
      <h3>{id}</h3>
      <h4> {user?.displayName}</h4>
      <h4>Senator: {user?.senator?.name}</h4>
      <h4>Representative: {user?.representative?.name}</h4>
    </>
  )
}

export default PublicProfile
