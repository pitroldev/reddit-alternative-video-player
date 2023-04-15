import React, { useEffect, useState } from 'react'

import {
  MAX_QUALITY,
  MIN_QUALITY,
  QUALITY_STEP,
  SUGGESTED_AUTO,
  SUGGESTED_QUALITY,
} from '../constants'

import './Popup.css'

const Popup = () => {
  const [quality, setQuality] = useState<number>(SUGGESTED_QUALITY)
  const [isAutoQualityOn, setIsAutoQualityOn] =
    useState<boolean>(SUGGESTED_AUTO)

  useEffect(() => {
    chrome.storage.sync.get(['quality', 'isAutoQualityOn'], function (result) {
      setQuality(result.quality ?? SUGGESTED_QUALITY)
      setIsAutoQualityOn(result.isAutoQualityOn ?? SUGGESTED_AUTO)
    })
  }, [])

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuality(Number(e.target.value))
    chrome.storage.sync.set({ quality: Number(e.target.value) })
  }

  const handleAutoQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAutoQualityOn(e.target.checked)
    chrome.storage.sync.set({ isAutoQualityOn: e.target.checked })
  }

  const getQualityText = (quality: number) => {
    if (isAutoQualityOn) return 'Auto'
    if (quality === MIN_QUALITY) return 'MIN'
    if (quality === MAX_QUALITY) return 'MAX'
    return quality
  }

  const qualityText = getQualityText(quality)

  return (
    <div className="popup-container">
      <h3>Reddit Alternative Video Player Settings</h3>
      <label className="auto-quality-label">
        <input
          className="auto-quality-selector"
          type="checkbox"
          checked={isAutoQualityOn}
          onChange={handleAutoQualityChange}
        />
        <span>Auto Quality</span>
      </label>
      <input
        className="quality-selector"
        type="range"
        step={QUALITY_STEP}
        min={MIN_QUALITY}
        max={MAX_QUALITY}
        value={quality}
        disabled={isAutoQualityOn}
        onChange={handleQualityChange}
      />
      <span className="quality-value">Video Quality: {qualityText}</span>
      <div className="popup-footer">
        <a
          className="patreon-link"
          href="https://www.patreon.com/pitroldev"
          target="_blank"
          rel="noopener noreferrer"
        >
          Support me on Patreon{' '}
          <span role="img" aria-label="heart">
            ❤️
          </span>
        </a>
      </div>
    </div>
  )
}

export default Popup
