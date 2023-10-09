import accounting from 'accounting'

export function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

