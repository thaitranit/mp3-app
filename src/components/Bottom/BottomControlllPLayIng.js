import React, { memo, useRef, useEffect, useState } from "react"
import fancyTimeFormat from "../../utils/fancyTimeFormat"
import { useDispatch, useSelector } from "react-redux"
import ReactPlayer from "react-player/lazy"
import { setCurrentIndexSong, setCurrentIndexSongShuffle, setCurrentTime } from "../../features/QueueFeatures/QueueFeatures"
import { setPlay, setReady } from "../../features/SettingPlay/settingPlay"
import { pushSongsLogged } from "../../features/Logged/loggedFeatures"
import { useCallback } from "react"
import { useLayoutEffect } from "react"
import { toast } from "react-toastify"

const BottomControlllPLayIng = memo(() => {
   const progressBar = useRef()
   const audioRef = useRef()
   const progresArea = useRef()
   const dispatch = useDispatch()
   const [oke, setOke] = useState(false)

   const currentEncodeId = useSelector((state) => state.queueNowPlay.currentEncodeId)
   const infoSongCurrent = useSelector((state) => state.queueNowPlay.infoSongCurrent)
   const currentTime = useSelector((state) => state.queueNowPlay.currentTime)
   const currentIndexSong = useSelector((state) => state.queueNowPlay.currentIndexSong)

   const { isLoop, volume, playing, muted, isRandom, progressInterval } = useSelector((state) => state.setting)

   const setTimeSong1 = useCallback(
      (e) => {
         let progressWidhtVal = progresArea.current.clientWidth // Lấy chiều x
         let clickedOffSetX = e.nativeEvent.offsetX // lấy value chiều x khi click
         let res = (clickedOffSetX / progressWidhtVal) * infoSongCurrent?.duration
         progressBar.current.style.width = (res / infoSongCurrent?.duration) * 100 + "%"
         dispatch(setCurrentTime(res))
         audioRef.current.seekTo(res)
      },
      [progresArea, infoSongCurrent, progressBar]
   )

   useEffect(() => {
      const setOff = () => {
         dispatch(setPlay(false))
      }
      window.addEventListener("beforeunload", setOff())
      return () => {
         window.removeEventListener("beforeunload", setOff())
      }
   }, [])

   // Tích hợp điều khiển màn hình khóa và Dynamic Island trên iOS
   useEffect(() => {
      if ("mediaSession" in navigator && infoSongCurrent) {
         try {
            navigator.mediaSession.metadata = new window.MediaMetadata({
               title: infoSongCurrent.title || "Felix MP3",
               artist: infoSongCurrent.artistsNames || "Nhiều nghệ sĩ",
               album: "Felix MP3",
               artwork: [
                  {
                     src: infoSongCurrent.thumbnailM || infoSongCurrent.thumbnail || "/pabicon.webp",
                     sizes: "512x512",
                     type: "image/jpeg",
                  },
               ],
            })

            navigator.mediaSession.setActionHandler("play", () => {
               dispatch(setPlay(true))
            })
            navigator.mediaSession.setActionHandler("pause", () => {
               dispatch(setPlay(false))
            })
            navigator.mediaSession.setActionHandler("previoustrack", () => {
               document.querySelector("#prevMusic")?.click()
            })
            navigator.mediaSession.setActionHandler("nexttrack", () => {
               document.querySelector("#nextMusic")?.click()
            })
         } catch (e) {
            console.error("MediaSession error:", e)
         }
      }
   }, [infoSongCurrent, dispatch])

   useLayoutEffect(() => {
      progressBar.current.style.width = (currentTime / infoSongCurrent?.duration) * 100 + "%"
   }, [currentTime])

   return (
      <div className="player_bottom">
         <p className="playing_time-left">{fancyTimeFormat(currentTime)}</p>
         <div onClick={setTimeSong1} ref={progresArea} className="playing_time-up2 progress-area">
            <div ref={progressBar} className="progress-bar" />
            <ReactPlayer
               width={0}
               height={0}
               ref={audioRef}
               progressInterval={progressInterval}
               config={{ file: { forceAudio: true } }}
               onReady={(e) => {
                  dispatch(setReady(true))
                  // save local
                  if (!oke && currentTime !== 0) {
                     audioRef.current.seekTo(currentTime)
                     setOke(true)
                  }
                  dispatch(pushSongsLogged(infoSongCurrent))
               }}
               onProgress={(e) => {
                  dispatch(setCurrentTime(e.playedSeconds))
               }}
               onEnded={() => {
                  if (!isLoop) {
                     if (isRandom) {
                        dispatch(setCurrentIndexSongShuffle(currentIndexSong + 1))
                     }
                     if (!isRandom) {
                        dispatch(setCurrentIndexSong(currentIndexSong + 1))
                     }
                     dispatch(setReady(false))
                     if (!playing) {
                        dispatch(setPlay(true))
                     }
                  }
               }}
               onError={(e) => {
                  console.error("ReactPlayer playback error:", e)
                  return toast("Không thể phát bài hát này (có thể là bài hát VIP hoặc bản quyền)", {
                     type: "error",
                  })
               }}
               playing={playing}
               loop={isLoop}
               volume={volume}
               muted={muted}
               /* Gọi luồng audio stream trực tiếp qua proxy local có đuôi định dạng .mp3 cho ReactPlayer */
               url={currentEncodeId ? `/api/stream/${currentEncodeId}.mp3` : ""}
            ></ReactPlayer>
         </div>
         <p className="playing_time-right">{fancyTimeFormat(infoSongCurrent?.duration)}</p>
      </div>
   )
})

export default BottomControlllPLayIng