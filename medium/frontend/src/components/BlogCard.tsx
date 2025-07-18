interface BlogcardProps {
  authorName: string;
  title: string;
  content: string;
  publishedDate: string;
}

export const BlogCard = ({
  authorName,
  title,
  content,
  publishedDate,
}: BlogcardProps) => {
  return (
    <div className="p-4 border-b border-slate-200 pb-4">
      <div className="flex font-semibold">
        {<Avatar name={authorName} />}
        <div className="font-extralight pl-2 text-sm flex justify-center flex-col">
          {" "}
          {authorName}
        </div>
        <div className="flex justify-center flex-col pl-2">
          <Circle />
        </div>
        <div className="pl-2 font-thin text-slate-500 text-sm flex justify-center flex-col">
          {publishedDate}
        </div>
      </div>
      <div className="font-semibold font-xl pt-2">{title}</div>
      <div className="font-thin foont-md">{content.slice(0, 100) + "..."}</div>
      <div className=" text-slate-500 text-sm font-thin pt-4">
        {`${Math.ceil(content.length / 100)} minute(s) read`}
      </div>
    </div>
  );
};

function Circle() {
  return <div className="h-1 w-1 rounded-full bg-slate-500"></div>;
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="relative inline-flex items-center justify-center w-4 h-6 overflow-hidden bg-black rounded-full">
      <span className="font-medium text-slate-100 dark:text-gray-300">
        {name[0]}
      </span>
    </div>
  );
}
