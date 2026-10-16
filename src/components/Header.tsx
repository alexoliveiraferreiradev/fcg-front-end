import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../cart/CartContext'
import { CartIcon, ChevronDownIcon, CloseIcon, LogoutIcon, MenuIcon, UserIcon } from './Icons'
import './Header.css'

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="FIAP Cloud Games, ir para o catálogo">
      <span className="logo__mark">
        FIAP<b>.</b>
      </span>
      <span className="logo__name">Cloud Games</span>
    </Link>
  )
}

function CartLink() {
  const { count, bumps } = useCart()
  return (
    <Link to="/carrinho" className="header__cart" aria-label={`Carrinho, ${count} ${count === 1 ? 'jogo' : 'jogos'}`}>
      <CartIcon />
      <span className="header__cart-label">Carrinho</span>
      {/* key troca a cada adição e reinicia a animação do contador */}
      <span key={bumps} className={`header__count${bumps > 0 ? ' header__count--bump' : ''}`} aria-hidden="true">
        {count}
      </span>
    </Link>
  )
}

function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) {
    return (
      <Link to="/entrar" className="btn btn--sm header__signin">
        Entrar
      </Link>
    )
  }

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="user-menu__trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        <UserIcon />
        <span className="user-menu__who">
          <span className="user-menu__email">{user.email}</span>
          <span className={`user-menu__role user-menu__role--${user.perfilUser.toLowerCase()}`}>{user.perfilUser}</span>
        </span>
        <ChevronDownIcon className="user-menu__chev" />
      </button>
      {open && (
        <div className="user-menu__pop" role="menu">
          <Link role="menuitem" to="/conta" onClick={() => setOpen(false)}>
            <UserIcon /> Minha conta
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false)
              logout()
            }}
          >
            <LogoutIcon /> Sair
          </button>
        </div>
      )}
    </div>
  )
}

export function Header() {
  const { isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // Fecha o menu do celular ao navegar.
  const [lastPath, setLastPath] = useState(location.pathname)
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setMenuOpen(false)
  }

  const links = [
    { to: '/', label: 'Catálogo', end: true },
    ...(isAdmin
      ? [{ to: '/admin', label: 'Admin', end: false }]
      : [
          { to: '/biblioteca', label: 'Minha biblioteca', end: false },
          { to: '/pedidos', label: 'Meus pedidos', end: false },
        ]),
  ]

  return (
    <header className="header">
      <div className="header__inner container">
        <button
          type="button"
          className="header__menu"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        <Logo />
        <nav id="main-nav" className={`header__nav${menuOpen ? ' header__nav--open' : ''}`} aria-label="Principal">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="header__actions">
          {!isAdmin && <CartLink />}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
