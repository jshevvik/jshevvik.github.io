const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

let cleanupCurrentPage: (() => void) | undefined

const initialiseMotion = () => {
  cleanupCurrentPage?.()

  const controller = new AbortController()
  const { signal } = controller
  const observers: IntersectionObserver[] = []
  const cleanups: Array<() => void> = []
  const reduce = reducedMotion.matches

  const revealItems = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
  if (reduce || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'))
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )
    revealItems.forEach((item) => revealObserver.observe(item))
    observers.push(revealObserver)
  }

  const header = document.querySelector<HTMLElement>('.site-header')
  const desktopNav = document.querySelector<HTMLElement>('.desktop-menu')
  const navIndicator = desktopNav?.querySelector<HTMLElement>('.nav-indicator')
  const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav-section]')]
  const desktopLinks = [...(desktopNav?.querySelectorAll<HTMLAnchorElement>('[data-nav-section]') ?? [])]
  let activeSection = 'inicio'
  let scrollFrame = 0

  const setIndicator = (link?: HTMLAnchorElement, immediate = false) => {
    if (!desktopNav || !navIndicator || !link) return
    const navRect = desktopNav.getBoundingClientRect()
    const linkRect = link.getBoundingClientRect()
    navIndicator.style.setProperty('--indicator-x', `${linkRect.left - navRect.left}px`)
    navIndicator.style.setProperty('--indicator-width', `${linkRect.width}px`)
    navIndicator.classList.toggle('is-immediate', immediate)
    navIndicator.classList.add('is-ready')
    if (immediate) requestAnimationFrame(() => navIndicator.classList.remove('is-immediate'))
  }

  const activateNavigation = (section: string) => {
    activeSection = section
    navLinks.forEach((link) => {
      const active = link.dataset.navSection === section
      link.classList.toggle('is-active', active)
      if (active) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
    setIndicator(desktopLinks.find((link) => link.dataset.navSection === section))
  }

  const path = window.location.pathname
  if (path.startsWith('/portfolio')) activeSection = 'proyecto'
  else if (path.startsWith('/blog')) activeSection = 'notas'
  else if (path.startsWith('/about-me')) activeSection = 'trayectoria'
  else if (path.startsWith('/contact')) activeSection = 'contacto'
  activateNavigation(activeSection)

  desktopLinks.forEach((link) => {
    link.addEventListener('pointerenter', () => setIndicator(link), { signal })
    link.addEventListener('focus', () => setIndicator(link), { signal })
  })
  desktopNav?.addEventListener('pointerleave', () => setIndicator(desktopLinks.find((link) => link.dataset.navSection === activeSection)), { signal })
  desktopNav?.addEventListener('focusout', (event) => {
    if (!desktopNav.contains(event.relatedTarget as Node | null)) {
      setIndicator(desktopLinks.find((link) => link.dataset.navSection === activeSection))
    }
  }, { signal })

  const sections = [...document.querySelectorAll<HTMLElement>('[data-section]')]
  if (sections.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const section = (visible?.target as HTMLElement | undefined)?.dataset.section
        if (section) activateNavigation(section)
      },
      { rootMargin: '-28% 0px -55% 0px', threshold: [0.05, 0.2, 0.45] },
    )
    sections.forEach((section) => sectionObserver.observe(section))
    observers.push(sectionObserver)
  }

  const hero = document.querySelector<HTMLElement>('.hero')
  const scene = hero?.querySelector<HTMLElement>('[data-hero-scene]')
  const layers = [...(hero?.querySelectorAll<HTMLElement>('[data-depth]') ?? [])]

  const motionIntensity = () => (window.matchMedia('(max-width: 767px)').matches ? 0.4 : 1)
  let motionFrame = 0
  let pointerTargetX = 0
  let pointerTargetY = 0
  let pointerCurrentX = 0
  let pointerCurrentY = 0
  let scrollTarget = 0
  let scrollCurrent = 0

  const paintHeroMotion = () => {
    const intensity = motionIntensity()
    pointerCurrentX += (pointerTargetX - pointerCurrentX) * 0.14
    pointerCurrentY += (pointerTargetY - pointerCurrentY) * 0.14
    scrollCurrent += (scrollTarget - scrollCurrent) * 0.12

    layers.forEach((layer) => {
      const depth = Number(layer.dataset.depth ?? 0)
      const baseScale = Number(layer.dataset.baseScale ?? 1.04)
      const scrollY = Number(layer.dataset.scrollY ?? 0)
      const scrollScale = Number(layer.dataset.scrollScale ?? 0)
      layer.style.setProperty('--layer-x', `${pointerCurrentX * depth * intensity}px`)
      layer.style.setProperty('--layer-y', `${pointerCurrentY * depth * 0.72 * intensity}px`)
      layer.style.setProperty('--layer-scroll-y', `${scrollCurrent * scrollY * intensity}px`)
      layer.style.setProperty('--layer-scale', `${baseScale + scrollCurrent * scrollScale * intensity}`)
    })

    const pointerSettled = Math.abs(pointerTargetX - pointerCurrentX) < 0.0005 && Math.abs(pointerTargetY - pointerCurrentY) < 0.0005
    const scrollSettled = Math.abs(scrollTarget - scrollCurrent) < 0.0005
    if (pointerSettled && scrollSettled) {
      pointerCurrentX = pointerTargetX
      pointerCurrentY = pointerTargetY
      scrollCurrent = scrollTarget
      motionFrame = 0
      return
    }
    motionFrame = requestAnimationFrame(paintHeroMotion)
  }

  const scheduleHeroMotion = () => {
    if (!reduce && layers.length && !motionFrame) motionFrame = requestAnimationFrame(paintHeroMotion)
  }

  const updateHeroScrollTarget = () => {
    if (!hero || reduce) return
    const rect = hero.getBoundingClientRect()
    const stickyTravel = Math.max(hero.offsetHeight - window.innerHeight, 1)
    scrollTarget = Math.max(0, Math.min(1, -rect.top / stickyTravel))
    scheduleHeroMotion()
  }

  const updateScroll = () => {
    const scrollY = window.scrollY
    header?.classList.toggle('is-scrolled', scrollY > 50)
    updateHeroScrollTarget()
    scrollFrame = 0
  }

  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll)
  }, { passive: true, signal })
  window.addEventListener('resize', () => {
    setIndicator(desktopLinks.find((link) => link.dataset.navSection === activeSection), true)
    updateHeroScrollTarget()
  }, { passive: true, signal })
  updateScroll()

  if (!reduce && hero && scene && layers.length) {
    hero.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return
      const rect = scene.getBoundingClientRect()
      pointerTargetX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2))
      pointerTargetY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2))
      scheduleHeroMotion()
    }, { signal })

    hero.addEventListener('pointerleave', () => {
      pointerTargetX = 0
      pointerTargetY = 0
      scheduleHeroMotion()
    }, { signal })

    cleanups.push(() => {
      if (motionFrame) cancelAnimationFrame(motionFrame)
    })
  }

  const toggle = document.querySelector<HTMLButtonElement>('.responsive-toggle')
  const mobileMenu = document.querySelector<HTMLElement>('#mobile-navigation')
  const mobileLinks = [...(mobileMenu?.querySelectorAll<HTMLAnchorElement>('a') ?? [])]
  let menuOpen = false

  const setMenu = (open: boolean, restoreFocus = false) => {
    if (!toggle || !mobileMenu) return
    menuOpen = open
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'Cerrar navegación' : 'Abrir navegación')
    toggle.querySelector('span')!.textContent = open ? 'Cerrar' : 'Menú'
    toggle.classList.toggle('is-open', open)
    mobileMenu.classList.toggle('show', open)
    document.documentElement.classList.toggle('menu-open', open)
    if (open) requestAnimationFrame(() => mobileLinks[0]?.focus())
    else if (restoreFocus) toggle.focus()
  }

  toggle?.addEventListener('click', () => setMenu(!menuOpen), { signal })
  mobileLinks.forEach((link) => link.addEventListener('click', () => setMenu(false), { signal }))
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuOpen) setMenu(false, true)
  }, { signal })
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && menuOpen) setMenu(false)
  }, { passive: true, signal })

  cleanupCurrentPage = () => {
    controller.abort()
    observers.forEach((observer) => observer.disconnect())
    cleanups.forEach((cleanup) => cleanup())
    if (scrollFrame) cancelAnimationFrame(scrollFrame)
    document.documentElement.classList.remove('menu-open')
  }
}

document.addEventListener('astro:page-load', initialiseMotion)
document.addEventListener('astro:before-swap', () => cleanupCurrentPage?.())
