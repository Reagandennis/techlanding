import Link from 'next/link';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  provider: string;
  imageSrc: string;
  imageAlt: string;
  badges: string[];
  href: string;
}

const CourseCard = ({ title, description, duration, level, provider, badges, href }: CourseCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
      <div className="h-48 bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-700">{provider}</div>
          <div className="text-sm text-red-600 mt-1">{level}</div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {badges.map((badge, index) => (
            <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              {badge}
            </span>
          ))}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>
        
        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <span>{duration}</span>
          <span>{level}</span>
        </div>
        
        <Link href={href} className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-center block">
          Learn More
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;