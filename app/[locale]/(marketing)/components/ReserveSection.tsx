import EmailForm from "./EmailForm"

interface ReserveSectionProps {
  title: string
  desc: string
  cssClass?: string
}

export default function ReserveSection({title,desc,cssClass}:ReserveSectionProps) {
  
  return (
    <section className={`bg-black py-20 px-5 text-center bg-no-repeat bg-cover ${cssClass}`}>
      <h2 className="text-4xl">{title}</h2>
      <p className="mt-3 font-light">{desc}</p>
      <div className="max-w-lg mx-auto mt-3">
        <EmailForm />
      </div>
    </section>
  )
}