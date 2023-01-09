
import replaceRedditPlayers from './core'

function handleOnCompleted() {
  const url = window.location.href
  const isReddit = url.includes('reddit.com')
  if (isReddit) {
    replaceRedditPlayers()
    setInterval(replaceRedditPlayers, 500)
  }
}

window.onload = handleOnCompleted
