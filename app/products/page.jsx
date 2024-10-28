"use client";
import {
  api,
  fix_date,
  matching,
  fix_number,
  get_session,
  alert_msg,
} from "@/public/script/public";
import Table from "@/app/component/table";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
export default function Products() {
  const router = useRouter();
  const config = useSelector((state) => state.config);
  const [data, setData] = useState([]);

  const columns = () => {
    return [
      {
        accessor: "invoice",
        sortable: true,
        title: "id",
        render: ({ id }) => (
          <div className="default select-text font-semibold">{id}</div>
        ),
      },
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
        accessor: "slug",
        sortable: true,
        title: "slug",
        render: ({ slug }) => (
          <div className="default select-text font-semibold">{slug}</div>
        ),
      },
     
      {
        accessor: "category",
        sortable: true,
        title: "category",
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
        accessor: "price",
        sortable: true,
        title: "price",
        render: ({ price }) => (
          <div className="default select-text font-semibold">{price}</div>
        ),
      },
         {
        accessor: "quantity",
        sortable: true,
        title: "quantity",
        render: ({ quantity }) => (
          <div className="default select-text font-semibold">{quantity}</div>
        ),
      },
           {
        accessor: "discount",
        sortable: true,
        title: "discount",
        render: ({ discount }) => (
          <div className="default select-text font-semibold">{discount}</div>
        ),
      },
      
     
      // {
      //   accessor: "orders",
      //   sortable: true,
      //   title: "orders",
      //   render: ({ orders, id }) => (
      //     <div className="default select-text font-semibold">
      //       {fix_number(orders)}
      //     </div>
      //   ),
      // },
      {
        accessor: "active",
        sortable: true,
        title: "status",
        render: ({ is_available, id }) => (
          <span
            className={`badge badge-outline-${is_available ? "success" : "danger"}`}
          >
            {is_available ? config.text.active: config.text.stopped}
          </span>
        ),
      },
      // {
      //   accessor: "created_at",
      //   sortable: true,
      //   title: "date",
      //   render: ({ created_at, id }) => (
      //     <div className="default select-text font-semibold">
      //       {fix_date(created_at)}
      //     </div>
      //   ),
      // },
    ];
  };
  const get = async () => {
    await fetch("https://sahl.future-developers.cloud/api/admin/product/all",  {
      method: "GET",
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
  useEffect(() => {
    document.title = config.text.all_products;
    get();
  }, []);
  
  return (
    <Table
      columns={columns}
      data={data}
      delete_={delete_}
      search={search}
      async_search={false}
      btn_name="add_product"
      add={() => router.push(`/products/add`)}
      edit={(id) => router.push(`/products/edit/${id}`)}
      no_delete={!data.length}
      no_search={!data.length}
    />
  );
}
