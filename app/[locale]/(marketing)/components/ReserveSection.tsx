interface ReserveSectionProps {
  title: string
  desc: string
  cssClass?: string
}

export default function ReserveSection({title,desc,cssClass}:ReserveSectionProps) {
  return (
    <section className={`bg-black py-20 px-5 text-center bg-no-repeat bg-cover ${cssClass}`}>
      <h2 className="text-4xl">{title}</h2>
      <p className="mt-3">{desc}</p>
      <div className="mt-3 max-w-lg mx-auto">
        <input placeholder="Enter your email" className="block w-full rounded p-3 bg-white mb-5" />
        <button className="focus:border block bg-blue-800 w-full text-white p-3 rounded uppercase">Reserve Save 40%</button>
      </div>
    </section>
  )
}