import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiHeart,
  HiStar,
  HiOutlineLocationMarker,
  HiShieldCheck
} from "react-icons/hi";

import { API_BASE } from "../../config";

/* Skeleton */
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

/* image parser */
function parseImages(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function FeaturedProperties() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [liked, setLiked] = useState({});

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);

      try {
        const res = await fetch(`${API_BASE}/properties`);
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();

        const incoming = data?.data
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

        setProperties(incoming);
      } catch (err) {
        console.error(err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const visibleProperties = properties.slice(0, visibleCount);
  const hasMore = visibleCount < properties.length;

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 3);
      setLoadingMore(false);
    }, 600);
  };

  const toggleLike = (e, id) => {
    e.stopPropagation(); // IMPORTANT: prevent navigation
    setLiked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="w-full px-6 md:px-12 py-12 bg-white">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          : visibleProperties.map((p) => {
              const images = parseImages(p.images);

              const image =
                images[0] ||
                p.mainImage ||
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267";

              const isVerified =
                p.verificationStatus === "verified" ||
                p.isVerified === true;

              const isLiked = liked[p.id];

              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/properties/${p.id}`)}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-all cursor-pointer"
                >

                  {/* IMAGE */}
                  <div className="relative h-48 overflow-hidden">

                    <img
                      src={image}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />

                    {/* VERIFIED BADGE */}
                    {isVerified && (
                      <div className="absolute top-3 left-3 bg-green-600 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                        <HiShieldCheck />
                        VERIFIED
                      </div>
                    )}

                    {/* HEART */}
                    <button
                      onClick={(e) => toggleLike(e, p.id)}
                      className="absolute top-3 right-3 w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center"
                    >
                      <HiHeart
                        className={
                          isLiked ? "text-red-500" : "text-slate-600"
                        }
                      />
                    </button>

                  </div>

                  {/* CONTENT */}
                  <div className="p-4">

                    <h3 className="font-medium text-slate-900 text-sm mb-1">
                      {p.title}
                    </h3>

                    <div className="flex items-center gap-1 text-slate-500 text-xs mb-2">
                      <HiOutlineLocationMarker />
                      {p.district || "Kigali"}
                    </div>

                    <div className="flex items-center justify-between">

                      <p className="text-brand-blue-bright font-semibold">
                        RWF {Number(p.rentAmount || 0).toLocaleString()}/mo
                      </p>

                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <HiStar className="text-yellow-400" />
                        {Number(p.rating || 0).toFixed(1)}
                      </div>

                    </div>

                  </div>

                </div>
              );
            })}
      </div>

      {/* LOAD MORE */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

    </section>
  );
}