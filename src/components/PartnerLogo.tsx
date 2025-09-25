import Image from 'next/image';

const PartnerLogo = ({ src, fallbackSrc, alt }: {
  src: string;
  fallbackSrc: string;
  alt: string;
}) => {
  return (
    <div className="flex items-center justify-center h-16 w-full bg-white rounded-lg p-4 hover:shadow-sm transition-shadow">
      <Image
        src={fallbackSrc} // Using fallback for now to avoid missing image issues
        alt={alt}
        width={120}
        height={60}
        className="max-h-10 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
      />
    </div>
  );
};

export default PartnerLogo;