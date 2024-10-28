    "use client";
    import { api, alert_msg, set_session, date, get_session, print } from '@/public/script/public';
    import Loader from '@/app/component/loader';
    import { useSelector } from 'react-redux';
    import { useEffect, useState } from 'react';
    import { useRouter, usePathname } from 'next/navigation';
    import Link from 'next/link';

    export default function Login () {

        const config = useSelector((state) => state.config);
        const router = useRouter();
        const pathname = usePathname();
        const [data, setData] = useState({});
        const [loader, setLoader] = useState(false);
        const [auth, setAuth] = useState(true);

        const submit = async(e) => {

            e.preventDefault();
            setLoader(true);
            const response = await api('auth/login', data);



            if ( response.data ) {
                set_session('user', {...response.data, logged: true, update: date()});
                if ( pathname === '/' ) router.replace('/account');
                else router.replace('/');
                alert_msg(config.text.login_successfully);
                setLoader(false);
                sessionStorage.setItem('user-data' , JSON.stringify(response.data.user));
                
            }
            else if ( response.errors ) {

                if ( response.errors.username ) {
                    setLoader(false);
                    alert_msg(config.text.error_email, 'error');
                }
                else if ( response.errors.password ) {
                    setLoader(false);
                    alert_msg(config.text.error_password, 'error');
                }

            }
            else {
                console.log('Unknown error');
                setLoader(false);
                alert_msg(config.text.alert_error, 'error');
            }


        }
        useEffect(() => {

            if ( get_session('user')?.access_token && get_session('user')?.logged ) return router.replace('/');
            else if ( get_session('user')?.access_token ) return router.replace('/auth/lock');
            else setAuth(false);

            document.title = config.text.login;
        }, []);

        return (

            <div className="flex items-center justify-center w-full h-[100vh] bg-[url('/media/public/map.svg')] bg-full bg-center dark:bg-[url('/media/public/map-dark.svg')]">
                {
                    !auth &&
                    <div className="panel w-full max-w-[420px] sm:w-[480px] no-select overflow-hidden">

                        <h2 className="mb-2 text-2xl font-bold">{config.text.login}</h2>

                        <p className="mb-7">{config.text.enter_to_login}</p>

                        <form className="space-y-6" onSubmit={submit}>

                            <div>
                                <label htmlFor="username" className='mb-3'>{config.text.email}</label>
                                <input id="username" type="username" value={data.email || ''} onChange={(e) => setData({...data, email: e.target.value})} required className="form-input" autoComplete='off'/>
                            </div>
                                
                            <div>
                                <label htmlFor="password" className='mb-3'>{config.text.password}</label>
                                <input id="password" type="password" value={data.password || ''} onChange={(e) => setData({...data, password: e.target.value})} required className="form-input" autoComplete='off'/>
                            </div>

                            {/* <p className="text-left my-2 rtl:text-right flex justify-end">
                            <Link href="/auth/forget-password" className="text-primary hover:underline ltr:ml-2 rtl:mr-2">
                                Forget your password ?
                            </Link>
                            </p> */}

                            <div className='py-1'>
                                <label className="cursor-pointer flex">
                                    <input type="checkbox" className="form-checkbox" required checked={data.agree || false} onChange={(e) => setData({...data, agree: !data.agree})}/>
                                    <span className="text-white-dark px-2 pt-[.5px]">
                                        {config.text.agree_terms}
                                    </span>
                                </label>
                            </div>

                            <button type="submit" className="btn btn-primary w-full h-[2.8rem] text-[.95rem]">{config.text.login}</button>

                        </form>

                        <div className="relative my-7 mb-4 h-5 text-center before:absolute before:inset-0 before:m-auto before:h-[1px] before:w-full before:bg-[#ebedf2] dark:before:bg-[#253b5c]">
                            
                            <div className="relative z-[1] inline-block bg-white px-2 font-bold text-white-dark dark:bg-black">
                                <span>{config.text.or}</span>
                            </div>

                        </div>

                        <p className="text-left my-2 rtl:text-right">
                            {config.text.forgot_password}
                            <Link href="tel:+201099188572" className="text-primary hover:underline ltr:ml-2 rtl:mr-2">{config.text.call_us}</Link>
                        </p>

                        { loader && <Loader /> }

                    </div>
                }
            </div>

        );

    };
