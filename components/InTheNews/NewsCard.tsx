import ArrowForward from "@mui/icons-material/ArrowForward"
import { useTranslation } from "next-i18next"
import { NewsItem } from "components/db"

type NewsCardProps = {
  newsItem: NewsItem
}

export const NewsCard = ({ newsItem }: NewsCardProps) => {
  const { t } = useTranslation("inTheNews")
  return (
    <div
      className="d-flex flex-row flex-fill gap-5 p-4"
      style={{
        backgroundColor: "#F6F7FF",
        borderTop: "6px solid var(--bs-secondary)"
      }}
    >
      <div
        className="d-flex flex-fill flex-column gap-2"
        style={{ minWidth: 0 }}
      >
        <div className="d-flex flex-row align-items-center gap-4 mb-1">
          <p className="m-0 fw-medium">
            {new Date(newsItem.publishDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "UTC"
            })}
          </p>
          <div
            style={{
              width: "1px",
              height: "1em",
              backgroundColor: "black",
              alignSelf: "center"
            }}
          />
          <p className="m-0">{newsItem.author}</p>
        </div>
        <div className="">
          <a
            className="fw-bold fs-4 lh-1 tracking-tight text-decoration-underline"
            href={newsItem.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {newsItem.title}
          </a>
        </div>
        <div className="text-truncate">{newsItem.description}</div>
      </div>
      <div className="align-self-end flex-shrink-0">
        <a
          className="d-flex gap-1 text-decoration-none hover-underline"
          href={newsItem.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#1587D3", fontWeight: 800 }}
        >
          {t("readMoreButton")}
          <ArrowForward />
        </a>
      </div>
    </div>
  )
}
