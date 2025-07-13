import { Quotes } from "../components/Quotes";
import { Auth } from "../components/Auth";

export const SignUp = () => {
  return (
    <div>
      <div className=" grid grid-cols-2">
        <div>
          <Auth />
        </div>
        <div className="invisible md:visible">
          <Quotes />
        </div>
      </div>
    </div>
  );
};
