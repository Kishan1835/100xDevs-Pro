import type { ChangeEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { SignUpInput } from "@tskishan3000/medium-post-common";
import { Button } from "./ui/button";

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
  const [postInputs, setPostInputs] = useState<SignUpInput>({
    email: "",
    password: "",
  });
  return (
    <div className="h-screen  flex justify-center flex-col">
      <div className="flex flex-col items-center justify-center">
        <div>
          <div className="px-10">
            <div className=" text-3xl font-extrabold">Create an acount</div>
            <div className="text-slate-400">
              {type === "signin"
                ? "Dont have an account?"
                : " Already have an account?"}
              <Link
                className="pl-2 underline"
                to={type === "signin" ? "/signup" : "/signin"}
              >
                {type === "signin" ? "Sign up" : "Sign in"}
              </Link>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <LabledInput
              label="Email"
              placeholder="xzy@gmail.com...."
              onChange={(e) => {
                setPostInputs({
                  ...postInputs,
                  email: e.target.value,
                });
              }}
            />
            <LabledInput
              label="Password"
              type={"password"}
              placeholder="123456"
              onChange={(e) => {
                setPostInputs({
                  ...postInputs,
                  password: e.target.value,
                });
              }}
            />
            <Button className="rounded-lg mt-8 w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">
              {type === "signup" ? "Sign up" : "Sign in"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LabledInputType {
  label: string;
  placeholder: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

function LabledInput({ label, placeholder, onChange, type }: LabledInputType) {
  return (
    <div>
      <label className="block mb-2 text-sm  text-black font-semibold ">
        {label}
      </label>
      <input
        onChange={onChange}
        type={type || "text"}
        id="first_name"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full  p-2.5"
        placeholder={placeholder}
        required
      />
    </div>
  );
}
