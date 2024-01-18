import { FC, PropsWithChildren } from "react"

const AdditionalResourcesCardContent: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <div
      className={`text-center align-self-center justify-content-xs-center justify-content-sm-left p-4 `}
    >
      <p className={`fs-4`}>{children}</p>
    </div>
  )
}

export default AdditionalResourcesCardContent
