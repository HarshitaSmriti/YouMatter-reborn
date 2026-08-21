type MoodCardProps = {
  title: string;
  subtitle: string;
  image: string;
  bg: string;
};

function MoodCard({
  title,
  subtitle,
  image,
  bg,
}: MoodCardProps) {
  return (
    <button
      className={`${bg} group flex min-w-[190px] flex-col items-center rounded-[32px] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
    >
      {/* SVG */}
      <img
        src={image}
        alt={title}
        className="h-[95px] w-[95px] object-contain transition-transform duration-300 group-hover:scale-105"
      />

      {/* TITLE */}
      <h3 className="mt-4 text-[20px] font-bold text-[#241b43]">
        {title}
      </h3>

      {/* SUBTITLE */}
      <p className="mt-1 text-center text-[13px] leading-6 text-[#6e6790]">
        {subtitle}
      </p>
    </button>
  );
}

export default MoodCard;