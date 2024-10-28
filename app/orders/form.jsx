"use client";
import {
  api,
  date,
  alert_msg,
  fix_date,
  print,
  get_session,
  confirm_deletion,
} from "@/public/script/public";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Loader from "@/app/component/loader";
import SelectProduct from "../component/selectProduct";
import SelectUsers from "../component/selectUsers";

export default function Form_Product({ id }) {
  const router = useRouter();
  const config = useSelector((state) => state.config);
  const [menu, setMenu] = useState("");
  const [data, setData] = useState({});
  const [users, setUsers] = useState({});
  const [loader, setLoader] = useState(true);
  const [categoryMenu, setCategoryMenu] = useState(false);
  const [selectCateg, setSelectCateg] = useState(0);
  const [fieldSelected , setFieldSelected] = useState(1);
  const [forms, setForms] = useState([{ title: "", type: "" }]);
  const [fields, setFields] = useState([
    { id: 1, name: "", country: ""},
  ]);

  const handleChange = (id, name , value) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, [name]: value } : field
    ));
  };

  const handleAddFields = () => {
    setFields([...fields, { id: Math.random(), product_id: "", quantity: "1", price: "0" }]);
  };

  const handleDeleteField = (id) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const default_item = () => {
    setData({
      title: "",
      description: "",
      type: 'bundle_discount',
      discount: 0,
      status: 1,
      products: fields.map(field => ({
        product_id: field.product_id,
        quantity: parseInt(field.quantity, 10) || 0,
        price: parseInt(field.price, 10) || 0
      }))

    });
    
    setLoader(false);
  };
   
  const get_item = async () => {
    const Id = Number(id);
    const token = get_session("user")?.access_token;
    if (!token) {
      setLoader(false);
      return alert_msg("Authorization token is missing", "error");
    }
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    try {
      const response = await fetch(
        `https://sahl.future-developers.cloud/api/admin/order/show/${id}`,
        {
          headers: headers,
          method: "GET",
        }
      );
      if (!response.ok) throw new Error("Network response was not ok " + response.statusText);
      const result = await response.json();
      setLoader(false);
      const product = result.data;
      console.log(product);
      
     setFields(
  product.products.map((item) => ({
    id : Math.random(),
    product: { name: item.name, id: item.id },
    quantity: item.quantity,
    price: item.price,
  }))
);
      if (!product?.id) return router.replace("/orders");
      setData({ ...product, category_id: product?.category?.id || [] });
      document.title = `${config.text.product} | ${product.name || ""}`;
    } catch (error) {
      console.error("There has been a problem with your fetch operation:", error);
    }
  };

  const save = async () => {
    let files = {};
    data.new_files?.forEach((file, index) => {
      files[`file_${index}`] = file.file;
      files[`file_${index}_type`] = file.type;
      files[`file_${index}_size`] = file.size;
      files[`file_${index}_name`] = file.name;
      files[`file_${index}_ext`] = file.ext;
    });

    const { thumbnail, ...rest } = data;
    
    const edit_data = {
      ...rest,
      status: Number(data.status),
      discount : data.type =='buy_x_get' ? null : data.discount,
      products: fields.map(field => ({
        product_id: field.product.id,
        quantity: parseInt(field.quantity, 10) || 0,
        price: parseInt(field.price, 10) || 0
      }))
    };

    if (id) {
      edit_data.product_id = id;
    }

    if (typeof data.image === "string") {
      delete data.image;
    }

    if (edit_data.image === undefined) {
      delete edit_data.image;
    }

    const oldKeys =
      data.keys?.reduce((acc, key, index) => {
        if (key.title && key.type) {
          acc[`keys[${index}][title]`] = key.title;
          acc[`keys[${index}][type]`] = key.type;
        }
        return acc;
      }, {}) || {};

    const newKeys = forms.reduce((acc, form, index) => {
      const newIndex = Object.keys(oldKeys).length / 2 + index;
      if (form.title && form.type) {
        acc[`keys[${newIndex}][title]`] = form.title;
        acc[`keys[${newIndex}][type]`] = form.type;
      }
      return acc;
    }, {});

    const formattedForms = { ...oldKeys, ...newKeys };
    const full_request_data = { ...edit_data, ...formattedForms };
    const url = id ? `admin/order/update/${id}` : "admin/order/create";
    console.log(full_request_data);

    try {
    const response = await fetch(
      `https://sahl.future-developers.cloud/api/${url}`,
      {
        method: "POST",
        body: JSON.stringify(full_request_data),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${get_session("user")?.access_token}`, // Use the token in the header
        },
      }
    );

    // تحقق من نجاح الاستجابة
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // قراءة بيانات الاستجابة
    const responseData = await response.json();
    
    console.log(responseData); // عرض البيانات في الكونسول

    return responseData;
  } catch (error) {
    console.error('Error:', error);
    // معالجة الأخطاء هنا
  }
  }

  const save_item = async () => {
    setLoader(true);
    const response = await save();
    if (response.status === "success") {
      if (id)
        alert_msg(`${config.text.item} ( ${id} ) - ${config.text.updated_successfully}`);
      else alert_msg(config.text.new_item_added);
      return router.replace("/orders");
    } else {
      alert_msg(config.text.alert_error, "error");
      setLoader(false);
    }
  };

  const delete_item = async () => {
    const Id = { id: [id] };
    try {
      const response = await fetch(
        `https://sahl.future-developers.cloud/api/admin/orders/delete`,
        {
          method: "DELETE",
          body: JSON.stringify(Id),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${get_session("user")?.access_token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Network response was not ok " + response.statusText);
      const result = await response.json();
      alert_msg(`${config.text.deleted_successfully}`);
      router.replace("/orders");
      setLoader(false);
      return true;
    } catch (error) {
      console.error("There has been a problem with your fetch operation:", error);
      return false;
    }
  };

  const handleDeleteForm = (indexToDelete) => {
    if (data.keys.length === 1) return;
    confirm_deletion("key", function () {
      setData((prevData) => {
        const newKeys = prevData.keys.filter(
          (_, index) => index !== indexToDelete
        );
        return { ...prevData, keys: newKeys };
      });
    });
  };

  const close_item = async () => {
    return router.replace("/products");
  };

  useEffect(() => {
    document.title = id ? config.text.edit_product : config.text.add_product;
    setMenu(localStorage.getItem("menu"));
    id ? get_item() : default_item();
  }, []);

  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("product_id", id);

        const response = await fetch("https://sahl.future-developers.cloud/api/admin/product/image/create", {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${get_session("user")?.access_token}`,
          },
        });

        if (response.ok) {
          get_item();
        } else {
          console.error("Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };
  




  return (
    <div className="edit-item-info relative">
      {loader ? (
        <Loader bg />
      ) : (
        <div className="flex flex-col gap-2.5 xl:flex-row">
          <div className="flex flex-1 flex-col xl:w-[70%]">
            {/* error here */}

            <div className="panel no-select flex-1 px-0 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
              {/* <div className="p-5">
                <Files data={data} setData={setData} />
              </div> */}

              <hr className="border-[#e0e6ed] dark:border-[#1b2e4b]" />

              <div className="mt-4 px-4">
                <div className="flex flex-col justify-between lg:flex-row">
                  <div className="div-2 mb-4 w-full lg:w-1/2 ltr:lg:mr-6 rtl:lg:ml-6">
                  <div className="relative flex items-center md:mt-4">
                      <div
                        className="reset-icon flex ltr:right-[.5rem] rtl:left-[.5rem]"
                        onClick={(e) =>
                          setData({ ...data, name: e.target.value })
                        }
                      >
                        <span className="material-symbols-outlined icon">
                          close
                        </span>
                      </div>

                      <label
                        htmlFor="select_user"
                        className="mb-0 w-1/4 ltr:mr-2 rtl:ml-2"
                      >
                        Select_User
                      </label>
                      <input
                        id="select_user"
                        type="text"
                        value={
                          data?.user?.name 
                        }
                        onClick={() => setCategoryMenu(true)}
                        className="pointer form-input flex-1"
                        readOnly
                      />
                    </div>
                      <div className="relative flex items-center mt-4 md:mt-4">
                      <div
                        className="reset-icon flex ltr:right-[.5rem] rtl:left-[.5rem]"
                        onClick={(e) =>
                          setData({ ...data, category_id: selectCateg?.id })
                        }
                      >
                       
                      </div>
                      

                     <label
                        htmlFor="type"
                        className="mb-0 w-1/4 ltr:mr-2 rtl:ml-2"
                      >
                        Payment_Status
                      </label>
                        <select
                        id="type"
                        value={data?.type || ""}
                        onChange={(e) =>
                          setData({ ...data, type: e.target.value })
                        }
                        className="form-select flex-1"
                      >
                        <option value="pending">pending</option>
                        <option value="paid">paid</option>
                        <option value="failed">failed</option>
                      </select>
                    </div>
                      <div className="relative flex items-center mt-4 md:mt-4">
                      <div
                        className="reset-icon flex ltr:right-[.5rem] rtl:left-[.5rem]"
                        onClick={(e) =>
                          setData({ ...data, category_id: selectCateg?.id })
                        }
                      >
                       
                      </div>
                      

                     <label
                        htmlFor="type"
                        className="mb-0 w-1/4 ltr:mr-2 rtl:ml-2"
                      >
                        Order_Status
                      </label>
                        <select
                        id="type"
                        value={data?.type || ""}
                        onChange={(e) =>
                          setData({ ...data, type: e.target.value })
                        }
                        className="form-select flex-1"
                      >
                        <option value="pending">pending</option>
                        <option value="processing">processing</option>
                        <option value="completed">completed</option>
                        <option value="delivery">delivery</option>
                        <option value="cancelled">cancelled</option>
                        <option value="finished">finished</option>
                      </select> 
                    </div>
                    
                    
                
                  </div>

                  
                </div>
              </div>

              {/* error here */}
              <hr className="mb-6 mt-4 border-[#e0e6ed] dark:border-[#1b2e4b]" />
                        
              

              <hr
                className={` ${
                  id ? "block border-[#e0e6ed] dark:border-[#1b2e4b]" : "hidden"
                }`}
              />
             
 <div className="p-4">
      <button
        onClick={handleAddFields}
        className="bg-blue-500 text-white p-2 rounded mb-4 px-10"
      >
        Add Offer
      </button>

      {fields.map((field) => (
        <div key={field.id} className="mb-4 flex items-center">
       <div>
           <label
                        htmlFor="product"
                        className="mb-2 w-1/4 ltr:mr-2 rtl:ml-2"
                      >
                       Product
                      </label>
          <input
            type="text"
            name="product_id"
            // value={field.product_id || ''}
            value={field?.product?.name}
            // onChange={(e) => handleChange(field.id, e)}
             
            className=" p-3 mr-2 rounded bg-[#121e32]"
            onClick={() => {setCategoryMenu(true); setFieldSelected(field.id)}}
            placeholder="Product"
            />
       </div>
           <div>
             <label
                        htmlFor="quantity"
                        className="mb-2 w-1/4 ltr:mr-2 rtl:ml-2"
                      >
                       Quantity
                      </label>
          <input
            type="text"
            name="quantity"
            value={field.quantity || ''}
            className=" p-3 mr-2 rounded bg-[#121e32]"
            onChange={(e) => handleChange(field.id, "quantity" , e.target.value)}
            placeholder="Quantity"
          />
           </div>
         <div>
           <label
                        htmlFor="price"
                        className="mb-2 w-1/4 ltr:mr-2 rtl:ml-2"
                      >
                       Price
                      </label>
                    <input
                    type = 'number'
                        id="price"
                        name="price"
                        placeholder="Price"
                        value={field.price || ''}
                        onChange={(e) => handleChange(field.id, "price" , e.target.value)}
                        className=" p-3 w-[200px] rounded bg-[#121e32]"
                        />
         </div>
          <div className = 'ml-2'>
           <label
                        htmlFor="offer"
                        className="mb-2 w-1/4 ltr:mr-2 rtl:ml-2 "
                      >
                       Offer
                      </label>
                    <input
                    readOnly
                    type = 'number'
                        id="offer"
                        name="offer"
                        placeholder="offer"
                        value={field.offer || ''}
                        className=" p-3 w-[200px] rounded bg-[#121e32]"
                        />
         </div>
         {fields.length > 2 && 
          <button
            onClick={() => handleDeleteField(field.id)}
            className="bg-red-500 text-white py-3 px-5 ml-5 rounded self-end"
          >
            Delete
          </button>
         }
         
        </div>
      ))}
    </div>
                
              <SelectUsers
                model={categoryMenu}
                setModel={setCategoryMenu}
                category
                onChange={(id, name) => {
                  setData({...data , user : {id ,  name}})
                }}
              />
            </div>

          </div>



          <div
            className={`left-tab no-select mt-6 w-full xl:mt-0 xl:w-[30%] ${
              menu === "vertical" ? "" : "space"
            }`}
          >
            <div>
              <div className="panel mb-5 pb-2">
                
                 <div className="mb-2 mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="check-input">
                    <label className="relative h-6 w-12">
                      <input
                        onChange={() =>
                          setData({ ...data, status: !data.status })
                        }
                        checked={data.status || false}
                        id="status"
                        type="checkbox"
                        className="pointer peer absolute z-10 h-full w-full opacity-0"
                      />

                      <span
                        className="block h-full rounded-full bg-[#ebedf2] before:absolute before:bottom-1 before:left-1 
                                                before:h-4 before:w-4 before:rounded-full before:bg-white 
                                                before:transition-all before:duration-300 peer-checked:bg-primary peer-checked:before:left-7 dark:bg-dark 
                                                dark:before:bg-white-dark dark:peer-checked:before:bg-white"
                      ></span>
                    </label>

                    <label
                      htmlFor="status"
                      className="pointer ltr:pl-3 rtl:pr-3"
                    >
                      Status
                    </label>
                  </div>
                </div>
              </div>
              

              <div className="panel">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1">
                  <button
                    type="button"
                    className="pointer btn btn-success w-full gap-2"
                    onClick={save_item}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ltr:mr-2 rtl:ml-2"
                    >
                      <path
                        d="M3.46447 20.5355C4.92893 22 7.28595 22 12 22C16.714 22 19.0711 22 20.5355 20.5355C22 19.0711 22 16.714 22 12C22 11.6585 22 11.4878 21.9848 11.3142C21.9142 10.5049 21.586 9.71257 21.0637 9.09034C20.9516 8.95687 20.828 8.83317 20.5806 8.58578L15.4142 3.41944C15.1668 3.17206 15.0431 3.04835 14.9097 2.93631C14.2874 2.414 13.4951 2.08581 12.6858 2.01515C12.5122 2 12.3415 2 12 2C7.28595 2 4.92893 2 3.46447 3.46447C2 4.92893 2 7.28595 2 12C2 16.714 2 19.0711 3.46447 20.5355Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M17 22V21C17 19.1144 17 18.1716 16.4142 17.5858C15.8284 17 14.8856 17 13 17H11C9.11438 17 8.17157 17 7.58579 17.5858C7 18.1716 7 19.1144 7 21V22"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        opacity="0.5"
                        d="M7 8H13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>{config.text.save}</span>
                  </button>
                  <button
                    type="button"
                    className="pointer btn btn-warning w-full gap-2"
                    onClick={close_item}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ltr:mr-2 rtl:ml-2"
                    >
                      <path
                        d="M12 7V13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      ></path>
                      <circle
                        cx="12"
                        cy="16"
                        r="1"
                        fill="currentColor"
                      ></circle>
                      <path
                        opacity="0.5"
                        d="M7.84308 3.80211C9.8718 2.6007 10.8862 2 12 2C13.1138 2 14.1282 2.6007 16.1569 3.80211L16.8431 4.20846C18.8718 5.40987 19.8862 6.01057 20.4431 7C21 7.98943 21 9.19084 21 11.5937V12.4063C21 14.8092 21 16.0106 20.4431 17C19.8862 17.9894 18.8718 18.5901 16.8431 19.7915L16.1569 20.1979C14.1282 21.3993 13.1138 22 12 22C10.8862 22 9.8718 21.3993 7.84308 20.1979L7.15692 19.7915C5.1282 18.5901 4.11384 17.9894 3.55692 17C3 16.0106 3 14.8092 3 12.4063V11.5937C3 9.19084 3 7.98943 3.55692 7C4.11384 6.01057 5.1282 5.40987 7.15692 4.20846L7.84308 3.80211Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      ></path>
                    </svg>
                    <span>{config.text.cancel}</span>
                  </button>
                  {id ? (
                    <button
                      type="button"
                      className="pointer btn btn-danger w-full gap-2"
                      onClick={delete_item}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ltr:mr-2 rtl:ml-2"
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
                      <span>{config.text.delete}</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
