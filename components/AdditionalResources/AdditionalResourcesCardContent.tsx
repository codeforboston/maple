import { FC, PropsWithChildren } from "react"

const AdditionalResourcesCardContent: FC<PropsWithChildren<{}>> = ({
  children
}) => {
  return (
    <div className={`d-flex flex-0 justify-content-xs-center p-4 `}>
      <p className={`fs-4`}>{children}</p>
    </div>
  )
}

export default AdditionalResourcesCardContent
