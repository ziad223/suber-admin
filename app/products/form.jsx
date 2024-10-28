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
import Files from "@/app/component/files";
import Select from "@/app/component/select";
import Loader from "@/app/component/loader";
import Unit from "../component/unit";
import { ProductGallery } from "../component/ProductGallery";
import ProductReview from "../component/ProductReview";

export default function Form_Product({ id }) {
  const router = useRouter();
  const config = useSelector((state) => state.config);
  const [menu, setMenu] = useState("");
  const [data, setData] = useState({});
  const [loader, setLoader] = useState(true);
  const [categoryMenu, setCategoryMenu] = useState(false);
  const [selectCateg, setSelectCateg] = useState(0);

  const [forms, setForms] = useState([{ title: "", type: "" }]);

  const handleAddForm = () => {
    setData((prevData) => ({
      ...prevData,
      keys: [
        ...prevData.keys,
        { title: "", type: "Select Type" }, // أو أي قيم افتراضية تريدها للنموذج الجديد
      ],
    }));
  };

  const handleChange = (index, field, value) => {
    setData((prevData) => ({
      ...prevData,
      keys: prevData.keys.map((form, i) =>
        i === index ? { ...form, [field]: value } : form
      ),
    }));
  };

  const default_item = async () => {
    setData({
      // id: 0,
      name: "",
      thumbnail: "",
      price: 0,
      quantity: 0,
      description: "",
      discount: 0,
      code : 0,
      brand : '',
      category_id : 1,
      is_available: 1,
      is_trend: 1,
      is_feature: 0,
      is_new: 1,
    });
    setLoader(false);
  };

  // show
  const get_item = async () => {
    const Id = Number(id);

    const token = get_session("user")?.access_token;
    if (!token) {
      setLoader(false);
      return alert_msg("Authorization token is missing", "error");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json", // إضافة Content-Type
    };

    await fetch(
      `https://sahl.future-developers.cloud/api/admin/product/show/${id}`,
      {
        headers: headers,
        method: "GET",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((response) => {
        // console.log(response.data.units)
        setLoader(false);
        const product = response.data;
        // console.log(product)
        if (!product?.id) return router.replace("/products");
        setData({ ...product, category_id: product?.category?.id || [] });
        document.title = `${config.text.product} | ${product.name || ""}`;
      })
      .catch((error) => {
        console.error(
          "There has been a problem with your fetch operation:",
          error
        );
      });
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
      thumbnail : typeof thumbnail == 'string' ? null : thumbnail ,
      category_id: selectCateg?.id ? selectCateg?.id : data?.category?.id,
      is_available: Number(data.is_available),
      is_trend: Number(data.is_trend),
      is_feature: Number(data.is_feature),
      is_new: Number(data.is_new),
    };

    if (id) {
      edit_data.product_id = id;
    }

    if (typeof data.image === "string") {
      delete data.image; // حذف الخاصية image إذا كانت قيمتها undefined
    }

    // console.log(data.image);

    if (edit_data.image === undefined) {
      delete edit_data.image;
    }

    // تحويل البيانات القديمة من data.keys إلى الشكل المطلوب، مع إزالة القيم الفارغة
    const oldKeys =
      data.keys?.reduce((acc, key, index) => {
        if (key.title && key.type) {
          acc[`keys[${index}][title]`] = key.title;
          acc[`keys[${index}][type]`] = key.type;
        }
        return acc;
      }, {}) || {};

    // تحويل البيانات الجديدة من forms إلى الشكل المطلوب
    const newKeys = forms.reduce((acc, form, index) => {
      const newIndex = Object.keys(oldKeys).length / 2 + index; // حساب الفهرس الجديد بناءً على عدد المفاتيح القديمة
      if (form.title && form.type) {
        acc[`keys[${newIndex}][title]`] = form.title;
        acc[`keys[${newIndex}][type]`] = form.type;
      }
      return acc;
    }, {});

    // دمج المفاتيح القديمة مع الجديدة
    const formattedForms = { ...oldKeys, ...newKeys };

    const full_request_data = { ...edit_data, ...formattedForms };
    const url = id ? `admin/product/update/${id}` : "admin/product/create";
    console.log(full_request_data);

    const response = await api(url, full_request_data);
    return response;
  };

  const save_item = async () => {
    if (!data.name) return alert_msg(config.text.name_required, "error");
    setLoader(true);
    const response = await save();
    // console.log(response)
    if (response.status === "success") {
      if (id)
        alert_msg(
          `${config.text.item} ( ${id} ) - ${config.text.updated_successfully}`
        );
      else alert_msg(config.text.new_item_added);
      return router.replace("/products");
    } else {
      alert_msg(config.text.alert_error, "error");
      setLoader(false);
    }
  };

  const delete_item = async () => {
    const Id = {
      id: [id],
    };
    try {
      const response = await fetch(
        `https://sahl.future-developers.cloud/api/admin/products/delete`,
        {
          method: "DELETE",
          body: JSON.stringify(Id),
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
      router.replace("/products");
      setLoader(false);
      return true; // Return true to indicate success
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      return false; // Return false to indicate failure
    }
  };

  const handleDeleteForm = (indexToDelete) => {
    if (data.keys.length === 1) {
      // إذا كان هناك عنصر واحد فقط، يمكنك إدارة ظهور واخفاء الزر هنا
      return;
    }

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
    // افتح نافذة اختيار الملف
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // تكوين البيانات لإرسالها للـ API
        const formData = new FormData();
        formData.append("image", file);
        formData.append("product_id", id);

        // رفع الملف إلى الـ API
        const response = await fetch("https://sahl.future-developers.cloud/api/admin/product/image/create", {
          method: "POST",
          body: formData,
           headers: {
            // "Content-Type": "multipart/form-data", // Set the content type to JSON
            Authorization: `Bearer ${get_session("user")?.access_token}`, // Use the token in the header
          },
        });
        

        if (response.ok) {
         get_item()
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
              <div className="p-5">
                <Files data={data} setData={setData} />
              </div>

              <hr className="border-[#e0e6ed] dark:border-[#1b2e4b]" />

              <div className="mt-4 px-4">
                <div className="flex flex-col justify-between lg:flex-row">
                  <div className="div-2 mb-4 w-full lg:w-1/2 ltr:lg:mr-6 rtl:lg:ml-6">
                    <div className="mt-4 flex items-center">
                      <label
                        htmlFor="name"
                        className="mb-0 w-1/4 ltr:mr-2 rtl:ml-2"
                      >
                        {config.text.name}
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={data?.name || ""}
                        onChange={(e) =>
                          setData({ ...data, name: e.target.value })
                        }
                        className="form-input flex-1"
                        autoComplete="off"
                      />
                    </div>
                    <div
                      className={` ${
                        data.type === "units"
                          ? "hidden"
                          : "mt-4 flex items-center"
                      }`}
                    >
                      <label
                        htmlFor="old_price"
                        className="mb-0 w-1/4 ltr:mr-2 rtl:ml-2"
                      >
                        {config.text.price}
                      </label>
                      <input
                        id="real_price"
                        type="number"
                        min="0"
                        value={data?.price || ""}
                        onChange={(e) =>
                          setData({ ...data, price: e.target.value })
                        }
                        className="form-input flex-1"
                        autoComplete="off"
                        disabled={data.type === "units"}
                      />
                    </div>

                    <div
                      className={` ${
                        data.type === "units"
                          ? "hidden"
                          : "mt-4 flex items-center"
                      }`}
                    >
                      <label
                        htmlFor="quantity"
                        className="mb-0 w-1/4 ltr:mr-2 rtl:ml-2"
                      >
                        {config.text.quantity}
                      </label>
                      <input
                        id="quantity"
                        type="text"
                        value={data?.quantity || ""}
                        onChange={(e) =>
                          setData({ ...data, quantity: e.target.value })
                        }
                        className="form-input flex-1"
                        autoComplete="off"
                        placeholder="No quantity specified !"
                        disabled={data?.type === "units"}
                      />
                    </div>
                    
                    
                      <div
                      className={` ${
                        data.type === "units"
                          ? "hidden"
                          : "mt-4 flex items-center"
                      }`}
                    >
                      <label
                        htmlFor="discount"
                        className="mb-0 w-1/4 ltr:mr-2 rtl:ml-2"
                      >
                       discount
                      </label>
                      <input
                        id="discount"
                        type="text"
                        value={data?.discount || ""}
                        onChange={(e) =>
                          setData({ ...data, discount: e.target.value })
                        }
                        className="form-input flex-1"
                        autoComplete="off"
                        disabled={data?.type === "units"}
                      />
                    </div>
                    <div className="relative flex items-center md:mt-4">
                      <div
                        className="reset-icon flex ltr:right-[.5rem] rtl:left-[.5rem]"
                        onClick={(e) =>
                          setData({ ...data, category_id: selectCateg?.id })
                        }
                      >
                        <span className="material-symbols-outlined icon">
                          close
                        </span>
                      </div>

                      <label
                        htmlFor="category"
                        className="mb-0 w-1/4 ltr:mr-2 rtl:ml-2"
                      >
                        {config.text.category}
                      </label>
                      <input
                        id="category"
                        type="text"
                        value={
                          selectCateg?.name || data?.category?.name || "-"
                        }
                        onClick={() => setCategoryMenu(true)}
                        className="pointer form-input flex-1"
                        readOnly
                      />
                    </div>
                     <div
                      className={` ${
                        data.type === "units"
                          ? "hidden"
                          : "mt-4 flex items-center"
                      }`}
                    >
                      <label
                        htmlFor="brand"
                        className="mb-0 w-1/4 ltr:mr-2 rtl:ml-2"
                      >
                       brand
                      </label>
                      <input
                        id="brand"
                        type="text"
                        value={data?.brand || ""}
                        onChange={(e) =>
                          setData({ ...data, brand: e.target.value })
                        }
                        className="form-input flex-1"
                        autoComplete="off"
                        disabled={data?.type === "units"}
                      />
                    </div>
                     <div
                      className={` ${
                        data.type === "units"
                          ? "hidden"
                          : "mt-4 flex items-center"
                      }`}
                    >
                      <label
                        htmlFor="code"
                        className="mb-0 w-1/4 ltr:mr-2 rtl:ml-2"
                      >
                       code
                      </label>
                      <input
                        id="code"
                        type="text"
                        value={data?.code || ""}
                        onChange={(e) =>
                          setData({ ...data, code: e.target.value })
                        }
                        className="form-input flex-1"
                        autoComplete="off"
                        disabled={data?.type === "units"}
                      />
                    </div>
                  </div>

                  
                </div>
              </div>

              {/* error here */}
              <hr className="mb-6 mt-4 border-[#e0e6ed] dark:border-[#1b2e4b]" />

              <div className="mb-4 mt-6 px-4">
                <label className="mb-4">description</label>

                <textarea
                  id="description"
                  value={data?.description || ""}
                  onChange={(e) =>
                    setData({ ...data, description: e.target.value })
                  }
                  className="no-resize form-textarea min-h-[80px]"
                  rows="5"
                ></textarea>
              </div>
              

              <hr
                className={` ${
                  id ? "block border-[#e0e6ed] dark:border-[#1b2e4b]" : "hidden"
                }`}
              />
              {id &&
              <>
               <div className="flex justify-between items-center m-5">
                    <label className="font-bold text-2xl ">Gallary</label>
                          <button
        type="button"
        className="pointer btn btn-info  w-[20%] gap-2"
        onClick={handleButtonClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        
        <span>Add Image</span>
      </button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

                </div>
                {data?.images?.length > 0 && 
            <ProductGallery data = {data.images} get_item = {get_item}/>
                
                }
              </>
              }
               
              <hr
                className={` ${
                  id ? "block border-[#e0e6ed] dark:border-[#1b2e4b]" : "hidden"
                }`}
              />
          <ProductReview/>

              <Select
                model={categoryMenu}
                setModel={setCategoryMenu}
                category
                onChange={(id, name) => {
                  setSelectCateg({ name: name, id: id });
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
                          setData({ ...data, is_available: !data.is_available })
                        }
                        checked={data.is_available || false}
                        id="is_available"
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
                      htmlFor="is_available"
                      className="pointer ltr:pl-3 rtl:pr-3"
                    >
                      is_available
                    </label>
                  </div>
                </div>
                 <div className="mb-2 mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="check-input">
                    <label className="relative h-6 w-12">
                      <input
                        onChange={() =>
                          setData({ ...data, is_trend: !data.is_trend })
                        }
                        checked={data.is_trend || false}
                        id="is_trend"
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
                      htmlFor="is_trend"
                      className="pointer ltr:pl-3 rtl:pr-3"
                    >
                      is_trend
                    </label>
                  </div>
                </div>
                 <div className="mb-2 mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="check-input">
                    <label className="relative h-6 w-12">
                      <input
                        onChange={() =>
                          setData({ ...data, is_feature: !data.is_feature })
                        }
                        checked={data.is_feature || false}
                        id="is_feature"
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
                      htmlFor="is_feature"
                      className="pointer ltr:pl-3 rtl:pr-3"
                    >
                      is_feature
                    </label>
                  </div>
                </div>
                 <div className="mb-2 mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="check-input">
                    <label className="relative h-6 w-12">
                      <input
                        onChange={() =>
                          setData({ ...data, is_new: !data.is_new })
                        }
                        checked={data.is_new || false}
                        id="is_new"
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
                      htmlFor="is_new"
                      className="pointer ltr:pl-3 rtl:pr-3"
                    >
                      is_new
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
