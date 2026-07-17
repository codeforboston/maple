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
      className="d-flex flex-row flex-fill gap-4 p-4 w-100"
      style={{
        backgroundColor: "var(--maple-surface-base)",
        borderRadius: "var(--maple-radius-lg)",
        boxShadow: "var(--maple-shadow-sm)"
      }}
    >
      <div
        className="d-flex flex-fill flex-column gap-2"
        style={{ minWidth: 0 }}
      >
        <div
          className="d-flex flex-row align-items-center gap-3 mb-1"
          style={{ color: "var(--maple-text-muted)", fontSize: "0.875rem" }}
        >
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
              backgroundColor: "var(--maple-border-default)",
              alignSelf: "center"
            }}
          />
          <p className="m-0">{newsItem.author}</p>
        </div>
        <h3
          className="m-0"
          style={{
            fontWeight: 700,
            fontSize: "1.25rem",
            lineHeight: 1.25,
            color: "var(--maple-text-strong)"
          }}
        >
          {newsItem.title}
        </h3>
        <div
          className="text-truncate"
          style={{ color: "var(--maple-text-body)", fontSize: "0.9375rem" }}
        >
          {newsItem.description}
        </div>
      </div>
      <div className="align-self-end flex-shrink-0">
        <a
          className="d-flex align-items-center gap-1 text-decoration-none hover-underline"
          href={newsItem.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t("readMoreButton")}: ${newsItem.title}`}
          style={{
            color: "var(--maple-brand-primary)",
            fontWeight: 700,
            fontSize: "0.9375rem"
          }}
        >
          {t("readMoreButton")}
          <ArrowForward sx={{ fontSize: "1.125rem" }} />
        </a>
      </div>
    </div>
  )
}
