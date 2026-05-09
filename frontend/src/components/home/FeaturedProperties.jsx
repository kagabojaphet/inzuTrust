import { useState } from "react";
import { HiHeart, HiStar, HiOutlineLocationMarker } from "react-icons/hi";

/* MOCK DATA (expanded) */
const allProperties = [
  {
    id: 1,
    title: "Modern Apartment in Kigali",
    location: "Kacyiru, Kigali",
    price: 450,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
  },
  {
    id: 2,
    title: "Luxury House with Garden",
    location: "Nyarutarama, Kigali",
    price: 1200,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
  },
  {
    id: 3,
    title: "Cozy Studio Near City Center",
    location: "Downtown, Kigali",
    price: 300,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"
  },
  {
    id: 4,
    title: "Family Home with Parking",
    location: "Kimironko, Kigali",
    price: 700,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be"
  },
  {
    id: 5,
    title: "Minimalist Apartment",
    location: "Kigali Heights",
    price: 550,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994"
  },
  {
    id: 6,
    title: "Modern Villa with Pool",
    location: "Rebero, Kigali",
    price: 1500,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227"
  },
  {
    id: 7,
    title: "City Apartment View",
    location: "Downtown, Kigali",
    price: 600,
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb"
  },
  {
    id: 8,
    title: "Elegant Family House",
    location: "Gacuriro, Kigali",
    price: 900,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c"
  },
   {
    id: 9,
    title: "Modern Apartment in Kigali",
    location: "Kacyiru, Kigali",
    price: 450,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
  },
   {
    id: 10,
    title: "Modern Apartment in Kigali",
    location: "Kacyiru, Kigali",
    price: 450,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
  },
];

/* 🔹 Skeleton Card */
function SkeletonCard() {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-slate-200 w-3/4 rounded" />
        <div className="h-3 bg-slate-200 w-1/2 rounded" />
        <div className="flex justify-between">
          <div className="h-3 bg-slate-200 w-1/3 rounded" />
          <div className="h-3 bg-slate-200 w-1/4 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProperties() {
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(false);

  const visibleProperties = allProperties.slice(0, visibleCount);
  const hasMore = visibleCount < allProperties.length;

  const loadMore = () => {
    setLoading(true);

    setTimeout(() => {
      setVisibleCount((prev) => prev + 3);
      setLoading(false);
    }, 800);
  };

  return (
    <section className="w-full px-6 md:px-12 py-12 bg-white">

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {visibleProperties.map((p) => (
          <div
            key={p.id}
            className="border border-slate-200 rounded-xl overflow-hidden transition-all"
          >

            {/* IMAGE */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={p.image}
                alt={p.title}
                className="w-full h-full object-cover"
              />

              <button className="absolute top-3 right-3 w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center">
                <HiHeart className="text-slate-600" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-4">

              <h3 className="font-medium text-slate-900 text-sm mb-1">
                {p.title}
              </h3>

              <div className="flex items-center gap-1 text-slate-500 text-xs mb-2">
                <HiOutlineLocationMarker />
                {p.location}
              </div>

              <div className="flex items-center justify-between">

                <p className="text-brand-blue-bright font-semibold">
                  ${p.price}/mo
                </p>

                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <HiStar className="text-yellow-400" />
                  {p.rating}
                </div>

              </div>

            </div>
          </div>
        ))}

        {/* SKELETON LOADING */}
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        }

      </div>

      {/* LOAD MORE */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

    </section>
  );
}