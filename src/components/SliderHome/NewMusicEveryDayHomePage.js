import React, { memo, useEffect, useState } from "react"
import { useGetHomePage } from "../../api/getHomePage"
import CarouselItem from "../Selection/CarouselItem"
import PlayListSelector from "../Selection/PlayListSelector"
import { v4 as uuidv4 } from "uuid"

const NewMusicEveryDayHomePage = () => {
   const [datas, setData] = useState(null)
   const { data, status, isLoading } = useGetHomePage()

   const dataSelector = data?.data?.items?.find(
      (e) =>
         e.sectionId === "hEditorTheme" ||
         e.sectionId === "hAutoTheme2" ||
         (e.sectionType === "playlist" && e.sectionId !== "h100" && e.sectionId !== "hAlbum")
   )

   useEffect(() => {
      if (data && dataSelector?.items) {
         setData(dataSelector.items)
      }
   }, [status, data, dataSelector])

   if (!isLoading && (!dataSelector || !dataSelector?.items?.length)) {
      return null
   }

   return (
      <PlayListSelector title={dataSelector?.title || "Giai Điệu Hôm Nay"}>
         {datas?.length > 0 &&
            datas.map((e, index) => {
               let classGird = "col l-2-4 m-3 c-5"
               if (index === 4) {
                  classGird = "col l-2-4 m-0 c-5"
               }

               return (
                  <CarouselItem
                     isSwiper={true}
                     key={e.encodeId}
                     artis={true}
                     desc={false}
                     class1={classGird}
                     item={e}
                  ></CarouselItem>
               )
            })}
         {(!datas || isLoading) &&
            Array(5)
               .fill(0)
               .map((e, index) => {
                  let classGird = "col l-2-4 m-3 c-5"
                  if (index === 4) {
                     classGird = "col l-2-4 m-0 c-5"
                  }

                  return (
                     <CarouselItem.Loading
                        key={uuidv4()}
                        artis={false}
                        desc={false}
                        class1={classGird}
                        item={e}
                     ></CarouselItem.Loading>
                  )
               })}
      </PlayListSelector>
   )
}

export default memo(NewMusicEveryDayHomePage)
