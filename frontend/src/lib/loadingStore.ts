type ShowFn = (message?: string) => void
type HideFn = () => void

let _show: ShowFn | null = null
let _hide: HideFn | null = null

export const loadingStore = {
  register(show: ShowFn, hide: HideFn) {
    _show = show
    _hide = hide
  },
  show(message = 'Please wait…') {
    _show?.(message)
  },
  hide() {
    _hide?.()
  },
}
