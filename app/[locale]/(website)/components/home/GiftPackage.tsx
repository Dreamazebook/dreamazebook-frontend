function GiftPackages() {
  const packages = [
    {
      id: 1,
      quantity: 'x2',
      title: 'Side by Side Set',
      description: 'Perfect for siblings or friends',
      discount: '10%',
      extras: 'holiday extras',
      image: 'https://images.pexels.com/photos/8923897/pexels-photo-8923897.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      quantity: 'x3',
      title: 'Growing Together Set',
      description: 'One story for each child to feel seen',
      discount: '15%',
      extras: 'free personalized cover',
      image: 'https://images.pexels.com/photos/8923897/pexels-photo-8923897.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      quantity: 'x4',
      title: 'Holiday Sharing Set',
      description: 'A joyful gift for holiday gatherings.',
      discount: '20%',
      extras: 'premium festive wrapping',
      image: 'https://images.pexels.com/photos/8923897/pexels-photo-8923897.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div
        className="relative h-[400px] md:h-[500px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/264985/pexels-photo-264985.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750)',
          backgroundPosition: 'center 40%'
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            Ready-to-Gift Packages
          </h1>
          <p className="text-base md:text-lg lg:text-xl mb-2 leading-relaxed">
            Handpicked bundles with books + keepsakes - beautifully wrapped for effortless gifting.
          </p>
          <p className="text-base md:text-lg lg:text-xl leading-relaxed">
            Create your own perfect gift set
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-20 bg-white"
          style={{
            clipPath: 'ellipse(100% 100% at 50% 100%)'
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {packages.map((pkg) => (
            <div key={pkg.id} className="flex flex-col items-center text-center">
              <div className="relative mb-6 md:mb-8">
                <div className="relative">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-48 h-56 md:w-56 md:h-64 object-cover rounded-lg shadow-xl"
                  />

                  <div className="absolute -top-3 -right-3 bg-blue-600 text-white rounded-full w-12 h-12 md:w-14 md:h-14 flex items-center justify-center font-bold text-lg md:text-xl shadow-lg">
                    {pkg.quantity}
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                  {pkg.title}
                </h2>

                <p className="text-sm md:text-base text-gray-600 max-w-xs mx-auto leading-relaxed">
                  {pkg.description}
                </p>

                <p className="text-sm md:text-base text-gray-700">
                  save <span className="font-bold text-blue-600">{pkg.discount}</span> + {pkg.extras}
                </p>
              </div>

              <button className="inline-flex items-center gap-2 text-gray-900 font-medium hover:text-blue-600 transition-colors group text-sm md:text-base">
                <span>Choose Books</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GiftPackages;
