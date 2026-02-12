const Heading = ({ title, span, desc }) => {
  return (
    <div className="mb-8 text-center">
      <h2 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
        <span className="text-transparent bg-clip-text bg-gradient-to-r to-blue-400 from-sky-400">
          {span}
        </span>{" "}
        {title}
      </h2>
      {desc && (
        <p className="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
          {desc}
        </p>
      )}
    </div>
  );
};

export default Heading;
