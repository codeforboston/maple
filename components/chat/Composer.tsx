import { useTranslation } from "next-i18next"
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react"
import styled from "styled-components"

const Wrap = styled.div`
  flex: none;
  border-top: 1px solid var(--maple-surface-border);
  background: var(--maple-surface-base);

  form {
    max-width: 760px;
    margin: 0 auto;
    padding: 14px 24px 16px;
  }

  @media (max-width: 820px) {
    form {
      padding: 10px 16px 12px;
    }
  }
`

const Field = styled.div`
  display: flex;
  align-items: flex-end;
  gap: var(--maple-space-sm);
  border: 1px solid var(--maple-border-default);
  border-radius: 14px;
  padding: 8px 8px 8px 14px;
  background: var(--maple-surface-base);
  transition: border-color var(--maple-transition-fast),
    box-shadow var(--maple-transition-fast);

  &:focus-within {
    border-color: var(--maple-chat-focus);
    box-shadow: 0 0 0 3px var(--maple-focus-ring);
  }

  textarea {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    resize: none;
    font: inherit;
    font-size: 1rem;
    line-height: 1.5;
    color: var(--maple-text-strong);
    padding: 9px 0;
    max-height: 160px;
    background: transparent;
    caret-color: var(--maple-brand-primary);
  }

  textarea::placeholder {
    color: var(--maple-text-muted);
  }

  textarea:disabled {
    cursor: not-allowed;
  }
`

const Action = styled.button<{ $primary?: boolean }>`
  flex: none;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  border-radius: var(--maple-radius-lg);
  padding: 9px 14px;
  font-weight: 700;
  background: ${p =>
    p.$primary ? "var(--maple-brand-primary)" : "var(--maple-chat-tint)"};
  color: ${p =>
    p.$primary ? "var(--maple-text-inverse)" : "var(--maple-brand-primary)"};

  &:hover:not(:disabled) {
    background: ${p =>
      p.$primary
        ? "var(--maple-brand-primary-strong)"
        : "var(--maple-chat-tint-strong)"};
  }

  &:disabled {
    background: var(--maple-color-gray-subtle-border);
    color: var(--maple-text-muted);
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 3px solid var(--maple-chat-focus);
    outline-offset: 2px;
  }
`

const Hint = styled.p`
  margin: 8px 2px 0;
  font-size: 0.8rem;
  color: var(--maple-text-muted);
`

const Sr = styled.label`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
`

/** Enter sends, Shift+Enter adds a line; focus stays here after sending. */
export function Composer({
  running,
  disabledReason,
  notice,
  onSend,
  onStop
}: {
  running: boolean
  /** Budget reached: the composer shows why it is off. */
  disabledReason?: string
  /** One-line status beside the composer: stopped, busy in another tab, still working. */
  notice?: string
  onSend: (text: string) => void
  onStop: () => void
}) {
  const { t } = useTranslation("chat")
  const [value, setValue] = useState("")
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  const send = (e?: FormEvent) => {
    e?.preventDefault()
    const text = value.trim()
    if (!text || running || disabledReason) return
    onSend(text)
    setValue("")
    ref.current?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) send(e)
  }

  return (
    <Wrap>
      <form onSubmit={send}>
        <Sr htmlFor="chat-composer">{t("composer.label")}</Sr>
        <Field>
          <textarea
            id="chat-composer"
            ref={ref}
            rows={1}
            value={value}
            placeholder={disabledReason ?? t("composer.placeholder")}
            disabled={!!disabledReason}
            onChange={e => setValue(e.target.value)}
            onKeyDown={onKeyDown}
          />
          {running && (
            <Action
              type="button"
              onClick={onStop}
              aria-label={t("composer.stopLabel")}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="3"
                  width="10"
                  height="10"
                  rx="2"
                  fill="currentColor"
                />
              </svg>
              <span aria-hidden="true">{t("composer.stop")}</span>
            </Action>
          )}
          <Action
            type="submit"
            $primary
            disabled={running || !value.trim() || !!disabledReason}
          >
            {t("composer.send")}
          </Action>
        </Field>
        <Hint role="status">{notice ?? t("composer.hint")}</Hint>
      </form>
    </Wrap>
  )
}
