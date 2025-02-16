interface PopupProps {
  tl: string
  desc:string
  surveyTxt: string
  surveyLink: string
  cancelTxt: string
}

export default function Popup({tl, desc, surveyTxt, surveyLink, cancelTxt}:PopupProps) {
  return (
    <div className="z-10 fixed top-0 left-0 w-full h-screen bg-black/50 flex justify-center items-center">
      <div className="bg-[#FCF2F2] rounded w-[680px] p-10 text-center">
        <h4 className="text-3xl font-bold">{tl}</h4>
        <p className="text-[#222222] my-3">{desc}</p>
        <a className="bg-[#012CCE] px-20 py-3 rounded text-white inline-block uppercase my-5" href={surveyLink}>{surveyTxt}</a>
        <a className="uppercase block">{cancelTxt}</a>
      </div>
    </div>
  )
}