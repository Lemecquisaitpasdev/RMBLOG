"use client"

import * as React from "react"

type WhenNearProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Avance prise sur l'écran, en marge CSS (par défaut une hauteur d'écran). */
  margin?: string
}

/** Ne monte son contenu qu'à l'approche de l'écran : les sections lourdes ne coûtent rien avant. */
export function WhenNear({ margin = "100% 0px", children, ...props }: WhenNearProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [near, setNear] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNear(true)
        io.disconnect()
      },
      { rootMargin: margin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [margin])

  return (
    <div ref={ref} {...props}>
      {near ? children : null}
    </div>
  )
}
