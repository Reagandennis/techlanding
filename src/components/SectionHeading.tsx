const SectionHeading = ({ eyebrow, title, description, id, alignment = 'center' }: {
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
  alignment?: 'left' | 'center';
}) => {
  const alignClasses = alignment === 'center' ? 'text-center' : 'text-left';
  
  return (
    <div className={alignClasses}>
      {eyebrow && (
        <p className="text-sm font-semibold text-red-600 tracking-wider uppercase mb-2">
          {eyebrow}
        </p>
      )}
      <h2 id={id} className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;