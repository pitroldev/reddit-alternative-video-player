import Hls from 'hls.js'

function generateRandomId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function numberBoundry(number: number, min: number, max: number) {
  return Math.min(Math.max(number, min), max)
}


function playHLSVideo(src: string, playerId: string) {
  try {
      const player = document.getElementById(playerId) as HTMLMediaElement;
      const hls = new Hls();
      hls.attachMedia(player);
      hls.on(Hls.Events.MEDIA_ATTACHED, function () {
          try {
              hls.loadSource(src);
              hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {

                  chrome.storage.sync.get(['quality', 'isAutoQualityOn'], function (result) {
                    if (!result.isAutoQualityOn) {
                      const quality = numberBoundry(result?.quality ?? 9, 0, hls.maxAutoLevel)
                      hls.startLevel = quality
                      hls.currentLevel = quality
                    } else {
                      hls.startLevel = -1
                      hls.currentLevel = -1
                    }
                  })

              });

              hls.on(Hls.Events.LEVEL_SWITCHED, function (event, data) {
                console.log(`[${playerId}] Quality level switched to `, hls.currentLevel)

            })

          } catch(err) {
              console.log(`[${playerId}] Error loading source`, err)
          }
      });
  } catch(err) {
      console.log(`[${playerId}] Error loading player`, err)
  }
}

function handleWrapper(wrapper: Element, index: number) {
  const videoWrappers = document.querySelectorAll('div[data-testid="shreddit-player-wrapper"]');
  const videoWrapper = videoWrappers[index] as Element;
  const videoElement = videoWrapper?.querySelector('*')?.querySelector('*') as HTMLVideoElement;

  const m3u8PlaylistSrc = (videoElement?.firstChild as HTMLVideoElement)?.src;

  if (typeof m3u8PlaylistSrc !== 'string') {
    setTimeout(() => handleWrapper(wrapper, index), 50)
    return
  }


  const randomId = generateRandomId()
  const video = document.createElement('video');

  video.controls = true;
  video.src = m3u8PlaylistSrc;
  video.id = `player-${randomId}`;

  video.style.width = '100%';
  video.style.height = '100%';
  video.style.objectFit = 'contain';

  videoWrapper.innerHTML = '';
  videoWrapper.appendChild(video);
  playHLSVideo(m3u8PlaylistSrc, video.id);
}

function replaceRedditVideo() {
  document
    .querySelectorAll('div[data-testid="shreddit-player-wrapper"]')
    .forEach(handleWrapper);
}


export default replaceRedditVideo
