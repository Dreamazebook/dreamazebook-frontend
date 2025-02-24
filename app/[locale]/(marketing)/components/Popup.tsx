import Button from "@/app/components/Button"

interface PopupProps {
  tl: string
  desc:string
  surveyTxt: string
  surveyLink: string
  cancelTxt: string
  handleCancel: (show: boolean) => void
}

export default function Popup({tl, desc, surveyTxt, surveyLink, cancelTxt, handleCancel}:PopupProps) {
  return (
    <div className="z-10 fixed top-0 left-0 w-full h-screen bg-black/50 flex justify-center items-center">
      <div className="bg-[url(/welcome/popup/app.png)] md:bg-[url(/welcome/popup/desktop.png)] bg-no-repeat bg-cover rounded w-[90%] max-w-2xl md:w-full py-20 pl-10 md:py-30 md:pl-15 pr-5 text-center">
        <h4 className="text-3xl font-bold">{tl}</h4>
        <p className="text-[#222222] my-3">{desc}</p>
        {/* <a className="bg-[#012CCE] px-20 py-3 rounded text-white inline-block uppercase my-5" href={surveyLink}>{surveyTxt}</a> */}
        <Button tl={surveyTxt} url={surveyLink} />
        <a className="uppercase block mt-5 cursor-pointer" onClick={()=>handleCancel(false)}>{cancelTxt}</a>
      </div>
    </div>
  )
}