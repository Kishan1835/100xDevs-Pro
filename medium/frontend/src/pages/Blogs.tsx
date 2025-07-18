import { BlogCard } from "../components/BlogCard";

export const Blogs = () => {
  return (
    <div className="flex justify-center">
      <div className=" max-w-xl">
        <BlogCard
          authorName={"Kishan"}
          title={"Jorney throught C++ adn the advance concept like Cmake "}
          content={
            "Intro to low level language and Memory management how data is stored "
          }
          publishedDate={"2 feb 2024"}
        />

        <BlogCard
          authorName={"Kishan"}
          title={"Jorney throught C++ adn the advance concept like Cmake "}
          content={
            "Intro to low level language and Memory management how data is stored "
          }
          publishedDate={"2 feb 2024"}
        />

        <BlogCard
          authorName={"Kishan"}
          title={"Jorney throught C++ adn the advance concept like Cmake "}
          content={
            "Intro to low level language and Memory management how data is stored "
          }
          publishedDate={"2 feb 2024"}
        />
      </div>
    </div>
  );
};
