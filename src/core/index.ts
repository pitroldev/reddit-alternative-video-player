import Hls from 'hls.js'

import { SUGGESTED_QUALITY, MIN_QUALITY, AUTO_QUALITY } from '../constants'

function generateRandomId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}

function numberBoundry(number: number, min: number, max: number) {
  return Math.min(Math.max(number, min), max)
}

function handleOnManifestParsed(hls: Hls) {
  chrome.storage.sync.get(['quality', 'isAutoQualityOn'], function (result) {
    const quality = numberBoundry(
      result?.quality ?? SUGGESTED_QUALITY,
      MIN_QUALITY,
      hls.maxAutoLevel
    )

    const isAutoQualityOn = Boolean(result.isAutoQualityOn)

    if (isAutoQualityOn) {
      hls.startLevel = AUTO_QUALITY
      hls.currentLevel = AUTO_QUALITY
    } else {
      hls.startLevel = quality
      hls.currentLevel = quality
    }
  })
}

function handleQualityLevelSwitch(hls: Hls) {
  console.log(`Quality level switched to `, hls.currentLevel)
}

function loadHLSVideo(hls: Hls, src: string) {
  try {
    hls.loadSource(src)
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      handleOnManifestParsed(hls)
    })
    hls.on(Hls.Events.LEVEL_SWITCHED, () => {
      handleQualityLevelSwitch(hls)
    })
  } catch (err) {
    console.log(`Error loading source`, err)
  }
}

function playHLSVideo(src: string, playerId: string) {
  try {
    const player = document.getElementById(playerId) as HTMLMediaElement
    const hls = new Hls()
    hls.attachMedia(player)
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      loadHLSVideo(hls, src)
    })
  } catch (err) {
    console.log(`Error loading player`, err)
  }
}

function handleWrapper(wrapper: Element, index: number) {
  const videoWrappers = document.querySelectorAll(
    'div[data-testid="shreddit-player-wrapper"]'
  )
  const videoWrapper = videoWrappers[index]
  const videoElement = videoWrapper
    ?.querySelector('*')
    ?.querySelector('*') as HTMLVideoElement

  const m3u8PlaylistSrc = (videoElement?.firstChild as HTMLVideoElement)?.src

  if (typeof m3u8PlaylistSrc !== 'string') {
    setTimeout(() => {
      handleWrapper(wrapper, index)
    }, 50)
    return
  }

  const randomId = generateRandomId()
  const video = document.createElement('video')

  video.controls = true
  video.src = m3u8PlaylistSrc
  video.id = `player-${randomId}`

  video.style.width = '100%'
  video.style.height = '100%'
  video.style.objectFit = 'contain'

  videoWrapper.innerHTML = ''
  videoWrapper.appendChild(video)
  playHLSVideo(m3u8PlaylistSrc, video.id)
}

function replaceRedditVideo() {
  document
    .querySelectorAll('div[data-testid="shreddit-player-wrapper"]')
    .forEach(handleWrapper)
}

export default replaceRedditVideo
