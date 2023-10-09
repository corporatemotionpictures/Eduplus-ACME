export default function palettes(
  state = {
    background: 'light',
    leftSidebar: 'light',
    navbar: 'light',
    rightSidebar: 'light'
  },
  action
) {

  state = window.localStorage.getItem('palatters') ? JSON.parse(window.localStorage.getItem('palatters')) : state
  return state
}
