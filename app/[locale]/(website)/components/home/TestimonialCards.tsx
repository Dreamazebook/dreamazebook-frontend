import React, { useState } from 'react';
import { FaArrowRight as ArrowRight, FaChevronLeft as ChevronLeft, FaChevronRight as ChevronRight } from 'react-icons/fa';

interface Testimonial {
  id: number;
  title: string;
  productImage: string;
  testimonial: string;
  author: string;
  date: string;
  ctaText: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    title: "They Harvest happiness Here",
    productImage: "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400",
    testimonial: "My mom said it was the best gift she had ever received! She never thought she could appear in a book, and she called it magic. She said she would always treasure it, which made me very happy.",
    author: "Where Are You!",
    date: "09/04/2024",
    ctaText: "Buy the same"
  },
  {
    id: 2,
    title: "Stories That Touch Hearts",
    productImage: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400",
    testimonial: "I couldn't put it down! The characters felt so real and the story kept me engaged from start to finish. It's been months since I read it and I still think about the ending.",
    author: "Sarah Mitchell",
    date: "15/03/2024",
    ctaText: "Order now"
  },
  {
    id: 3,
    title: "Knowledge That Transforms",
    productImage: "https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=400",
    testimonial: "This book completely changed how I approach my daily routine. The practical advice is easy to follow and the results speak for themselves. Highly recommend to anyone looking to improve their life.",
    author: "Michael Chen",
    date: "22/02/2024",
    ctaText: "Get your copy"
  },
  {
    id: 4,
    title: "Adventures Beyond Imagination",
    productImage: "https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400",
    testimonial: "An absolutely thrilling read that took me on an incredible journey. The world-building is phenomenal and the plot twists kept me guessing until the very end. A masterpiece of storytelling.",
    author: "Emma Rodriguez",
    date: "08/01/2024",
    ctaText: "Start reading"
  },
  {
    id: 5,
    title: "Wisdom for Modern Living",
    productImage: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400",
    testimonial: "Every page offers profound insights that are immediately applicable to real life. The author has a gift for making complex concepts simple and actionable. This book is a game-changer.",
    author: "David Thompson",
    date: "12/12/2023",
    ctaText: "Discover more"
  }
];

const TestimonialCards: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentTestimonial = testimonials[currentIndex];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  const handleCtaClick = () => {
    console.log(`CTA clicked for: ${currentTestimonial.title}`);
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-12 text-center relative">
      {/* Navigation arrows */}
      <button
        onClick={prevTestimonial}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      
      <button
        onClick={nextTestimonial}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
        aria-label="Next testimonial"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>

      {/* Title */}
      <h1 className="text-4xl font-bold text-black mb-16 leading-tight">
        {currentTestimonial.title}
      </h1>

      {/* Product Image */}
      <div className="mb-16 flex justify-center">
        <img
          src={currentTestimonial.productImage}
          alt="Product"
          className="w-40 h-52 object-cover shadow-lg transition-opacity duration-300"
          key={currentTestimonial.id}
        />
      </div>

      {/* Testimonial with dots */}
      <div className="mb-12">
        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Quote */}
        <div className="relative">
          <span className="absolute -top-6 left-4 text-6xl text-gray-300 font-serif">"</span>
          <blockquote className="text-xl text-gray-800 leading-relaxed font-medium px-4">
            {currentTestimonial.testimonial}
          </blockquote>
        </div>
      </div>

      {/* Author */}
      <div className="mb-12 flex items-center justify-center gap-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-600 font-medium">
            {currentTestimonial.author.charAt(0)}
          </span>
        </div>
        <div className="text-left">
          <h3 className="font-semibold text-gray-900 text-lg">{currentTestimonial.author}</h3>
          <p className="text-gray-500">{currentTestimonial.date}</p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleCtaClick}
        className="inline-flex items-center gap-3 text-black text-xl font-medium
                   hover:gap-4 transition-all duration-200 group"
      >
        {currentTestimonial.ctaText}
        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" />
      </button>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-gray-400">
        {currentIndex + 1} / {testimonials.length}
      </div>
    </div>
  );
};

export default TestimonialCards;