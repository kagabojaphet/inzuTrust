export default function FlagImg({ src, alt, size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-6 h-6', lg: 'w-7 h-7' };
  return (
    <img
      src={src}
      alt={alt}
      className={`${sizes[size]} rounded-full object-cover border border-gray-200 shrink-0`}
    />
  );
}