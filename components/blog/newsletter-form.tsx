"use client"

import * as React from "react"

/** Le formulaire de la lettre. Front seulement : rien n'est envoyé pour l'instant. */
export function NewsletterForm() {
  const [sent, setSent] = React.useState(false)
  const inputId = React.useId()

  if (sent) {
    return (
      <p role="status" className="bevel-in bg-white px-3 py-2 font-mono text-[13px] text-black">
        Merci ! Le back n&apos;est pas encore branché : rien n&apos;a été envoyé. Revenez bientôt.
      </p>
    )
  }

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault()
        setSent(true)
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        Votre adresse e-mail
      </label>
      <input id={inputId} type="email" required placeholder="vous@exemple.fr" autoComplete="email" className="win-input" />
      <button type="submit" className="win-btn shrink-0 font-bold">
        S&apos;abonner
      </button>
    </form>
  )
}
