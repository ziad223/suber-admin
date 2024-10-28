'use client'
import React, { useState } from 'react';
import Table from './table';
import { get_session } from '@/public/script/public';
const ProductReview = () => {

const [data, setData] = useState([]);

   const columns = () => {
    return [
    
      {
        accessor: "info",
        sortable: true,
        title: "name",
        render: ({ thumbnail, id, name }) => (
          <div className="flex items-center font-semibold">
            <div className="layer-div h-7 w-7 overflow-hidden rounded-[.5rem] ltr:mr-3 rtl:ml-3">
              <img
                src={`${thumbnail}`}
                className="h-full w-full rounded-[.5rem] object-cover"
                onLoad={(e) =>
                  e.target.src.includes("_icon")
                    ? e.target.classList.add("empty")
                    : e.target.classList.remove("empty")
                }
                onError={(e) => (e.target.src = `/media/public/empty_icon.png`)}
              />
            </div>
            <div className="default max-w-[15rem] select-text truncate font-semibold">
              {name}
            </div>
          </div>
        ),
      },
    
     
      {
        accessor: "review",
        sortable: true,
        title: "review",
        render: ({ category, id }) => (
          <div>
            {category ? (
              <div
                className="pointer flex items-center font-semibold hover:text-primary hover:underline"
                onClick={() => router.push(`/categories/edit/${category.id}`)}
              >
                {/* <div className="h-7 w-7 rounded-[.5rem] overflow-hidden ltr:mr-3 rtl:ml-3">
                                    <img 
                                        src={`${category.image}`} className="h-full w-full rounded-[.5rem] object-cover" 
                                        onLoad={(e) => e.target.src.includes('_icon') ? e.target.classList.add('empty') : e.target.classList.remove('empty')}
                                        onError={(e) => e.target.src = `/media/public/empty_icon.png`}
                                    />
                                </div> */}
                <div className="max-w-[10rem] select-text truncate font-semibold">
                  {category}
                </div>
              </div>
            ) : (
              <div className="default select-text font-semibold"></div>
            )}
          </div>
        ),
      },
       {
        accessor: "comment",
        sortable: true,
        title: "comment",
        render: ({ price }) => (
          <div className="default select-text font-semibold">{price}</div>
        ),
      },
       
    ];
  };
   const get = async () => {
    await fetch("https://sahl.future-developers.cloud/api/admin/product/review/create",  {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Set the content type to JSON
        Authorization: `Bearer ${get_session("user")?.access_token}`, // Use the token in the header
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((response) => {
        const product = response.data;
        setData(product);
        console.log(response.data);
        
      })
      .catch((error) => {
        console.error(
          "There has been a problem with your fetch operation:",
          error
        );
      });
  };

const delete_ = async (payload) => {
  try {
    const response = await fetch(
      `https://sahl.future-developers.cloud/api/admin/product/delete`,
      {
        method: "DELETE",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json", // Set the content type to JSON
          Authorization: `Bearer ${get_session("user")?.access_token}`, // Use the token in the header
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    console.log(response);
    

    const result = await response.json();
    alert_msg(`${config.text.deleted_successfully}`);
    return true; // Return true to indicate success
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
    return false; // Return false to indicate failure
  }
};
  const search = (items, query) => {
    let result = items.filter(
      (item) =>
        matching(`--${item.id}`, query) ||
        matching(item.name, query) ||
        matching(item.category, query) ||
        matching(item.type, query) ||
        matching(item.orders, query) ||
        // matching(fix_number(item.price, "float"), query) ||
        // matching(fix_number(item.orders), query) ||
        matching(
          item.active ? config.text.active : config.text.stopped,
          query
        ) ||
        matching(item.created_at, query) ||
        matching(fix_date(item.created_at), query)
    );

    return result;
  };
  return (
    <div className=''>
       <Table
      columns={columns}
      data={data?.reviews}
      delete_={delete_}
      search={search}
      async_search={false}
      btn_name="add_product"
      add={() => router.push(`/products/add`)}
      edit={(id) => router.push(`/products/edit/${id}`)}
      no_delete={!data.length}
      no_search={!data.length}
    />
    </div>
  );
}

export default ProductReview;
