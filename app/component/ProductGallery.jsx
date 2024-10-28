import { get_session } from "@/public/script/public";
import React, { useState } from "react";
export function ProductGallery({data , get_item }) {
    const [ id , setId] = useState(data[0]?.id || null);
 
 
  const [active, setActive] = useState(data[0]?.image || null);

 async function delete_img (){
     const response = await fetch(
        `https://sahl.future-developers.cloud/api/admin/product/image/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json", // Set the content type to JSON
            Authorization: `Bearer ${get_session("user")?.access_token}`, // Use the token in the header
          },
        }
      );
      if(response.ok){
        get_item();
      }
  }
 
  return (
<div className="grid gap-4 my-5 lg:w-[80%] mx-auto">
  <div className="relative group">
    <img
      className="product-image h-auto w-full max-w-full rounded-lg object-cover object-center md:h-[480px]"
      src={active}
      alt=""
    />
    <div className="trash-icon absolute right-10 top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <button
        onClick={delete_img}
        className="bg-red-500 text-white p-2 rounded-full"
      >
          <svg 
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                      >
                        <path
                          opacity="0.5"
                          d="M9.17065 4C9.58249 2.83481 10.6937 2 11.9999 2C13.3062 2 14.4174 2.83481 14.8292 4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        ></path>
                        <path
                          d="M20.5001 6H3.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        ></path>
                        <path
                          d="M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        ></path>
                        <path
                          opacity="0.5"
                          d="M9.5 11L10 16"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        ></path>
                        <path
                          opacity="0.5"
                          d="M14.5 11L14 16"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        ></path>
                      </svg>
      </button>
    </div>
  </div>
  <div className="grid grid-cols-5 gap-4">
    {data.map(({ image, id }, index) => (
      <div key={index}>
        <img
          onClick={() => { setActive(image); setId(id); }}
          src={image}
          className="h-20 max-w-full cursor-pointer rounded-lg object-cover object-center"
          alt="gallery-image"
        />
      </div>
    ))}
  </div>
</div>


  );
}