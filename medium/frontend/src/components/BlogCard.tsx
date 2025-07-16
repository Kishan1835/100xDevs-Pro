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
    <div>
      <div className="flex font-semibold">
        <div className="flex justify-center flex-col">
          {<Avatar name={authorName} />}
        </div>
        <div className="font-extralight pl-2"> {authorName}</div>
        <div>&#9679;</div>
        <div className="pl-2 font-thin text-slate-500"> {publishedDate}</div>
      </div>

      <div className="font-semibold ">
        <div>{title}</div>
        <div>{content.slice(0, 100)}+"..."</div>
        <div>{`${Math.ceil(content.length / 100)} minutes`} </div>
        <div className="bg-slate-200 h-1 w-full"></div>
      </div>
    </div>
  );
};

function Avatar({ name }: { name: string }) {
  return (
    <div className="relative inline-flex items-center justify-center w-4 h-4 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
      <span className="font-medium text-gray-600 dark:text-gray-300">
        {name[0]}
      </span>
    </div>
  );
}
