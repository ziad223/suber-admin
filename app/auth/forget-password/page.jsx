"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Loader from '@/app/component/loader';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [loader, setLoader] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (values) => {
        setLoader(true);
        setError(null);
        try {
            const { data } = await axios.post("https://sahl.future-developers.cloud/api/auth/forget-password", values);
            console.log(data);
            
            if (data.status === 'success') {
                console.log('Request successful:', data);
                sessionStorage.setItem("session_id", data.data.session_id);
                router.push('/auth/reset-password');
            } else {
                console.error('Request failed:', data.message);
                setError(data.message || 'Request failed');
            }
        } catch (error) {
            console.error('Request error:', error);
            setError('Your email does not exist. Please try again.');
        } finally {
            setLoader(false);
        }
    };

    const validationSchema = Yup.object({
        email: Yup.string().required("Email is required").email("Please enter a valid email"),
    });

    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema,
        onSubmit: handleSubmit,
    });

    return (
        <div className="flex items-center justify-center w-full h-[100vh] bg-[url('/media/public/map.svg')] bg-full bg-center dark:bg-[url('/media/public/map-dark.svg')]">
            <div className="panel w-full max-w-[420px] sm:w-[480px] no-select overflow-hidden">
                <h2 className="mb-2 text-2xl font-bold">Forget Password</h2>
                <p className="mb-7">Enter your email to get a new password</p>
                <form className="space-y-6" onSubmit={formik.handleSubmit}>
                    <div>
                        <label htmlFor="email" className="mb-3">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            className="form-input"
                            autoComplete="off"
                        />
                        {formik.errors.email && formik.touched.email && (
                            <div className="text-red-600 font-bold mt-2">{formik.errors.email}</div>
                        )}
                    </div>
                      <p className="text-left my-2 rtl:text-right">
                
                </p>
                    <div className="py-1">
                        <label className="cursor-pointer flex">
                            <input
                                type="checkbox"
                                name="terms"
                                className="form-checkbox"
                                required
                            />
                            <span className="text-white-dark px-2 pt-[.5px]">I agree to the terms and conditions</span>
                        </label>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-full h-[2.8rem] text-[.95rem]"
                        disabled={loader}
                    >
                        {loader ? 'Loading...' : 'Send'}
                    </button>
                </form>
                {error && (
                    <div className="mt-4 text-red-600 font-bold">
                        {error}
                    </div>
                )}
            
              
                {loader && <Loader />}
            </div>
        </div>
    );
}
