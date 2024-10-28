'use client'
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import Loader from '@/app/component/loader';

const page = () => {
    const [loader, setLoader] = useState(false);
    let session_id = sessionStorage.getItem("session_id");
   let router = useRouter();
    
  const formik = useFormik({
    initialValues: {
      session_id : session_id,  
      password: '',
      password_confirmation: '',
      acceptedTerms: false,
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Required'),
      password_confirmation: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required'),
      acceptedTerms: Yup.boolean()
        .oneOf([true], 'You must accept the terms and conditions')
        .required('Required'),
    }),
    onSubmit: (values) => {
      // Replace with your API call
        setLoader(true);
      fetch('https://sahl.future-developers.cloud/api/auth/forget-password/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
        .then(response => response.json())
        .then(data => {
          // Handle successful response
          console.log('Success:', data);
          if(data.status === 'success'){
            router.replace('/auth/login')
          }
        })
        .catch((error) => {
          // Handle error response
          console.error('Error:', error);
        });
          setLoader(false);
    },
  });
  
  return (
    <section className="">
      <div className="flex flex-col items-center justify-center px-6  mx-auto md:h-screen lg:py-0">
        <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
          <h2 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Change Password
          </h2>
          <form onSubmit={formik.handleSubmit} className="mt-4 space-y-4 lg:mt-5 md:space-y-5">
            
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                New Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                className={`bg-gray-50 border ${formik.errors.password && formik.touched.password ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                {...formik.getFieldProps('password')}
              />
              {formik.errors.password && formik.touched.password ? (
                <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
              ) : null}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Confirm password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="••••••••"
                className={`bg-gray-50 border ${formik.errors.password_confirmation && formik.touched.password_confirmation ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                {...formik.getFieldProps('password_confirmation')}
              />
              {formik.errors.password_confirmation && formik.touched.password_confirmation ? (
                <div className="text-red-500 text-xs mt-1">{formik.errors.password_confirmation}</div>
              ) : null}
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="acceptedTerms"
                  aria-describedby="acceptedTerms"
                  type="checkbox"
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
                  {...formik.getFieldProps('acceptedTerms')}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="acceptedTerms" className="font-light text-gray-500 dark:text-gray-300">
                  I accept the <a className="font-medium text-primary-600 hover:underline dark:text-primary-500" href="#">Terms and Conditions</a>
                </label>
                {formik.errors.acceptedTerms && formik.touched.acceptedTerms ? (
                  <div className="text-red-500 text-xs mt-1">{formik.errors.acceptedTerms}</div>
                ) : null}
              </div>
            </div>
            <button
            disabled={loader}
              type="submit"
              className="btn btn-primary w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Reset Password
            </button>
          </form>
        </div>
        {loader && <Loader />}
      </div>
    </section>
  );
};

export default page;
