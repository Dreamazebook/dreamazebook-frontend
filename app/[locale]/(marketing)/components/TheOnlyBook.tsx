import Image from "next/image";
export default function TheOnlyBook() {
  return (
    <div className="bg-blue-50 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-5xl font-bold mb-8 leading-15">The Only Book<br/>Where You Are <span className="text-blue-500">Truly Seen</span></h2>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
          If you want to personalize a book that truly reflects your loved ones, not generic avatars but their real name, image, and uniqueness
        </p>
        <p className="font-bold mb-6">Dreamazebook is the best choice!</p>
        <video className="w-full" src="/welcome/the-only-book/video.mp4" autoPlay controls loop />

        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="w-full md:w-2/3 relative aspect-square">
            <Image src="/welcome/the-only-book/lucas.png" alt="Lucas" className="object-cover" fill />
          </div>
          <div className="w-full md:w-1/3 flex gap-4 flex-row md:flex-col">
            <div className="w-1/2 md:w-full relative aspect-square">
              <Image src="/welcome/the-only-book/melody.png" alt="Melody" className="object-cover" fill />
            </div>
            <div className="w-1/2 md:w-full relative aspect-square">
              <Image src="/welcome/the-only-book/mia.png" alt="Mia" className="object-cover" fill />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}