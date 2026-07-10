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
import axios from "axios" // Đã tích hợp axios để gọi API lấy link nhạc

const BottomControlllPLayIng = memo(() => {
   const progressBar = useRef()
   const audioRef = useRef()
   const progresArea = useRef()
   const dispatch = useDispatch()
   const [oke, setOke] = useState(false)
   const [streamUrl, setStreamUrl] = useState("") // State lưu link mp3 thực tế sau khi bypass qua proxy

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

   // Tự động gọi API lấy link nhạc qua Proxy mới ổn định
   useEffect(() => {
      const getStreamLink = async () => {
         if (!currentEncodeId) return
         try {
            // Thay đổi hẳn sang cụm Proxy dự phòng có thuật toán giải mã Zing mới nhất
            const res = await axios.get(`https://zing-mp3-api.vercel.app/api/song?id=${currentEncodeId}`)
            
            // Cập nhật tầng dữ liệu trả về theo cấu trúc mới
            const targetData = res?.data?.data;
            const audioLink = targetData?.["128"] || targetData?.["320"] || res?.data?.url;
            
            if (audioLink) {
               // Đảm bảo link luôn chạy HTTPS để không bị lỗi Mixed Content
               const secureAudioLink = audioLink.replace(/^http:/i, "https:");
               setStreamUrl(secureAudioLink)
            } else {
               setStreamUrl("")
               toast("Bài hát bản quyền/VIP hoặc lỗi link stream!", { type: "warning" })
            }
         } catch (error) {
            console.log("Lỗi lấy link nhạc qua proxy:", error)
            setStreamUrl("")
         }
      }
      getStreamLink()
   }, [currentEncodeId])

   useEffect(() => {
      const setOff = () => {
         dispatch(setPlay(false))
      }
      window.addEventListener("beforeunload", setOff())
      return () => {
         window.removeEventListener("beforeunload", setOff())
      }
   }, [])

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
               onError={() => {
                  return toast("Có lỗi xảy ra, vui lòng thử lại", {
                     type: "error",
                  })
               }}
               playing={playing}
               loop={isLoop}
               volume={volume}
               muted={muted}
               url={streamUrl} // Sử dụng link nhạc proxy sạch đã lấy được ở trên thay vì link Zing trực tiếp bị 404
            ></ReactPlayer>
         </div>
         <p className="playing_time-right">{fancyTimeFormat(infoSongCurrent?.duration)}</p>
      </div>
   )
})

export default BottomControlllPLayIng