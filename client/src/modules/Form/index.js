import React, { useState } from 'react';
import Input from '../../components/input';
import Button from '../../components/button';
import { useNavigate } from 'react-router-dom';

const Form = ({ isSignInPage = true }) => {
    const [data, setData] = useState({
        ...(!isSignInPage && { fullName: '' }),
        email: "",
        password: "",
    });
    const [showPass, setShowPass]= useState(false);
    const [showCongrats, setShowCongrats] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Data=>', data);
            const res = await fetch(`http://localhost:8000/api/${isSignInPage ? 'login' : 'register'}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (res.status === 400) {
                alert('Invalid Credentials');
            } else {
                const resData = await res.json()
                if (resData.token) {
                    localStorage.setItem('token', resData.token);
                    localStorage.setItem('user:detail', JSON.stringify(resData.user)); 
                    setShowCongrats(true); 
                    setTimeout(() => {
                        navigate('/');
                    }, 2000);
                } 
                else if (!isSignInPage && resData.message === 'User registered successfully') {
                    setShowCongrats(true);
                    setTimeout(() => {
                        navigate('/users/sign_in');
                    }, 2000);
                } 
                else {
                    alert('Registration failed. Please try again.');
                }
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className='bg-light h-screen flex items-center justify-center'>
            <div className="bg-teal-100 w-[600px] h-[700px] p-5 max-w-lg shadow-lg rounded-2xl border shadow-teal-900 flex flex-col justify-center items-center">
                <div className="text-4xl font-bold mb-4">Hello! Welcome {isSignInPage && 'Back'}</div>
                <div className="text-xl font-thin mb-8">{isSignInPage ? 'Sign In' : 'Sign Up'}</div>
                {showCongrats && (
                    <div className="alert alert-success font-thin mb-4" role="alert">
                        Congratulations! You have successfully {isSignInPage ? 'signed in' : 'registered'}.
                    </div>
                )}
                <form className="flex flex-col items-center w-full" onSubmit={handleSubmit}>
                    {!isSignInPage && (
                        <Input
                            label="Full Name"
                            name="fullName"
                            placeholder='Enter Full Name'
                            className='mb-4 w-[75%]'
                            value={data.fullName}
                            onChange={(e) => setData({ ...data, fullName: e.target.value })}
                        />
                    )}
                    <Input
                        label="Email Address"
                        name="email"
                        type='email'
                        placeholder='Enter Email'
                        className='mb-4 w-[75%]'
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                    />
                    <div className="relative mb-4 w-[75%]">
                        <Input
                            label="Password"
                            type={showPass? "text":"password"}
                            name="password"
                            placeholder='Enter Password'
                            className='w-full'
                            value={data.password}
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                        />
                        <button 
                            type='button'
                            className=' absolute inset-y-0 right-0 flex items-center px-3 pt-8 text-gray-600'
                            onClick={() => setShowPass(!showPass)}
                        >
                            {showPass ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                                    <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
                                    <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
                                </svg>
                            )}
                        </button>
                    </div>
                    <Button
                        label={isSignInPage ? 'Sign In' : 'Sign Up'}
                        className='w-[75%] mt-4 mb-2'
                        type='submit'
                    />
                </form>
                <div className='mt-4'>
                    {isSignInPage ? "Didn't have an Account!" : "Already have an account?"}
                    <span
                        className="text-teal-600 cursor-pointer underline ml-1"
                        onClick={() => navigate(`/users/${isSignInPage ? 'sign_up' : 'sign_in'}`)}
                    >
                        {isSignInPage ? "Sign Up" : "Sign In"}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Form;
