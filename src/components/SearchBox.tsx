import { useRef, useState, type FormEvent } from 'react'
import { parseSearchTerm, SEARCH_MAX_LENGTH } from '../lib/search'
import { CloseIcon, SearchIcon } from './Icons'
import './SearchBox.css'

interface Props {
  /** Termo ativo (da URL). O campo acompanha quando ele muda por fora (voltar/avançar do navegador). */
  term: string | undefined
  onSearch: (term: string) => void
  onClear: () => void
}

/** Busca do catálogo. Pesquisa ao enviar, não a cada tecla: cada busca é um request ao Kong. */
export function SearchBox({ term, onSearch, onClear }: Props) {
  const [value, setValue] = useState(term ?? '')
  const [synced, setSynced] = useState(term)
  const input = useRef<HTMLInputElement>(null)
  if (term !== synced) {
    setSynced(term)
    setValue(term ?? '')
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next = parseSearchTerm(value)
    if (next) onSearch(next)
    else onClear()
  }

  return (
    <form role="search" className="search" onSubmit={submit}>
      <label htmlFor="catalog-search" className="sr-only">
        Buscar jogos
      </label>
      <div className="search__control">
        <SearchIcon className="search__icon" />
        <input
          ref={input}
          id="catalog-search"
          type="search"
          className="search__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={SEARCH_MAX_LENGTH}
          placeholder="Buscar por nome, gênero ou descrição"
          autoComplete="off"
          enterKeyHint="search"
        />
        {value && (
          <button
            type="button"
            className="search__clear"
            aria-label="Limpar busca"
            onClick={() => {
              setValue('')
              onClear()
              input.current?.focus()
            }}
          >
            <CloseIcon />
          </button>
        )}
      </div>
      <button type="submit" className="btn search__submit">
        Buscar
      </button>
    </form>
  )
}
