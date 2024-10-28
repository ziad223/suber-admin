"use client";
import { api, matching, fix_date, print, alert_msg } from "@/public/script/public";
import { get_session } from "@/public/script/public";
import Table from "@/app/component/table";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function Admins() {
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
        render: ({ name, id, avatar }) => (
          <div className="flex items-center font-semibold">
            <div className="layer-div -mt-[2px] h-7 w-7 overflow-hidden rounded-full ltr:mr-3 rtl:ml-3">
              <img
                src={avatar}
                className="h-full w-full rounded-full object-cover"
                onLoad={(e) =>
                  e.target.src.includes("_icon")
                    ? e.target.classList.add("empty")
                    : e.target.classList.remove("empty")
                }
                onError={(e) => (e.target.src = `/media/public/user_icon.png`)}
              />
            </div>
            <div className="default max-w-[15rem] select-text truncate font-semibold">
              {name}
            </div>
          </div>
        ),
      },
      {
        accessor: "phone",
        sortable: true,
        title: "phone",
        render: ({ phone, id }) => (
          <div className="default max-w-[10rem] select-text truncate font-semibold">
            {phone ? phone : ''}
          </div>
        ),
      },
      {
        accessor: "email",
        sortable: true,
        title: "email",
        render: ({ email, id }) => (
          <div className="default max-w-[15rem] select-text truncate font-semibold">
            {email}
          </div>
        ),
      },
      {
        accessor: "active",
        sortable: true,
        title: "status",
        render: ({ status, id }) => (
          <span
            className={`badge badge-outline-${status ? "success" : "danger"}`}
          >
            {status ? config.text.active : config.text.stopped}
          </span>
        ),
      },
      {
        accessor: "created_at",
        sortable: true,
        title: "date",
        render: ({ created_at, id }) => (
          <div className="default select-text font-semibold">
            {fix_date(created_at)}
          </div>
        ),
      },
    ];
  };
  const get = async () => {
    await fetch(
      "https://sahl.future-developers.cloud/api/admin/user/all",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${get_session("user")?.access_token}`, // استخدام التوكن في الهيدر
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((response) => {
        const admins = response.data.data.filter(
          (user) => user.role === "admin"
        );
        setData(admins);
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
        `https://sahl.future-developers.cloud/api/admin/user/delete`,
        {
          method: "Delete",
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
        matching(item.email, query) ||
        matching(item.phone, query) ||
        matching(item.country, query) ||
        matching(item.city, query) ||
        matching(
          item.status ? config.text.active : config.text.stopped,
          query
        ) ||
        matching(item.created_at, query) ||
        matching(fix_date(item.created_at), query)
    );

    return result;
  };
  useEffect(() => {
    document.title = config.text.all_admins || "";
    get();
  }, []);
  return (
    <Table
      columns={columns}
      data={data}
      delete_={delete_}
      search={search}
      async_search={false}
      btn_name="add_admin"
      add={() => router.push(`/admins/add`)}
      edit={(id) => router.push(`/admins/edit/${id}`)}
      no_delete={!data.length}
      no_search={!data.length}
    />
  );
}
