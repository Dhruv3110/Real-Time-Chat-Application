import React, { useEffect, useState, useRef } from 'react';
import Snapchat from '../../assets/snapchat.png'; 
import Input from '../../components/input'; 
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom';
const Dashboard = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')));
    const [converse, setConverse] = useState([]);
    const [messages, setMessages] = useState({});
    const [message, setMessage] = useState('');
    const [users, setUsers] = useState([]);
    const [socket, setSocket] = useState(null)
    const messageRef = useRef(null)
    const navigate = useNavigate();
    
    useEffect(()=>{
        setSocket(io('http://localhost:8080'))
    }, [])

    useEffect(()=>{
        socket?.emit('addUser', user?.id) 
        socket?.on('getUsers', users =>{
        })
        socket?.on('getMessage', data =>{
            setMessages(prev => ({
                ...prev, 
                messages: [...prev.messages, {user: data.user, message: data.message}]
            }))
        })
    }, [socket, user])

    useEffect(()=>{
        messageRef?.current?.scrollIntoView({behavior: 'smooth'})
    },[messages?.messages])

    useEffect(() => {
        const logInUser = JSON.parse(localStorage.getItem('user:detail'));
        // setUser(logInUser);
        const fetchConversation = async () => {
            const res = await fetch(`http://localhost:8000/api/converse/${logInUser?.id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const resData = await res.json();
            setConverse(resData);
        };
        fetchConversation();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch(`http://localhost:8000/api/users/${user?.id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const resData = await res.json();
            setUsers(resData);
        };
            fetchUsers();
    }, [user]);

    const fetchMessages = async (converseId, receiver) => {
        try {
            const res = await fetch(`http://localhost:8000/api/messages/${converseId}?senderId=${user?.id}&receiverId=${receiver?.receiverId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const resData = await res.json();
            setMessages({ messages: resData, receiver, converseId });
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async (e) => {
        setMessage('');
        socket?.emit('sendMessage',{
            senderId: user?.id,
            receiverId: messages?.receiver?.receiverId,
            message,
            converseId: messages?.converseId
        })
        const res= await fetch(`http://localhost:8000/api/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                converseId: messages?.converseId,
                senderId: user?.id,
                message,
                receiverId: messages?.receiver?.receiverId
            })
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('user:detail');
        localStorage.removeItem('token');
        navigate('/users/sign_in');
    };
    return (
        <div className="flex flex-col lg:flex-row w-full h-screen">
            {/* Left sidebar */}
            <div className="lg:w-1/4 w-full bg-teal-100 h-full overflow-y-scroll shadow-inner shadow-teal-950">
                {/* User profile section */}
                <div className="flex items-center mt-4 mb-4 mx-4 cursor-pointer">
                    <div className="border border-primary p-[2px] rounded-full">
                        <img src={Snapchat} alt="" width={75} height={75} className="rounded-full" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-2xl">{user?.fullName}</h3>
                        <p className="text-lg font-light">My Account</p>
                        <button className="mt-3 py-2 bg-teal-500 text-white rounded-full w-[120px]" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
                <hr/>
                {/* Messages section */}
                <div className="mx-5 my-3">
                    <div className="text-xl font-semibold text-gray-700">Messages</div>
                    <div>
                        {
                            converse.length > 0 ?
                            converse.map(({ converseId, user }) => {
                                return(
                                    <div className="flex items-center py-2 border-b border-b-gray-400">
                                        <div className="cursor-pointer flex items-center" onClick={()=>fetchMessages(converseId, user)}>
                                            <div>
                                                <img src={Snapchat} alt="" width={60} height={60} className="rounded-full" />
                                            </div>
                                            <div className="ml-6 text-gray-700">
                                                <h3 className="text-lg font-semibold">{user?.fullName}</h3>
                                                <p className="text-sm font-thin">{user?.email}</p>
                                            
                                            </div>
                                        </div>
                                    </div>
                                )
                            }) :  <div className="text-center text-lg font-semibold my-28 underline">No Conversation</div>
                        }
                    </div>
                </div>
            </div>
            {/* Main content area */}
            <div className="lg:w-2/4 w-full h-full bg-white flex flex-col items-center">
                {
                    messages?.receiver?.fullName  &&
                
                    <div className="w-[75%] bg-secondary h-[80px] my-10 rounded-full flex items-center px-10 shadow-lg shadow-teal-900 py-3">
                        <div className="cursor-pointer">
                            <img src={Snapchat} alt="" width={55} height={55} className="rounded-full" />
                        </div>
                        <div className="ml-6">
                            <h3 className="text-lg">{messages?.receiver?.fullName}</h3>
                            <p className="text-sm font-light">{messages?.receiver?.email}</p>
                        </div>
                    </div>
                }
                {/* Scrollable chat messages */}
                <div className="h-[75%] w-full shadow-inner shadow-teal-800 overflow-y-scroll">
                    <div className="p-10">
                        {
                            messages?.messages?.length> 0 ?
                            messages.messages.map(({message, user: {id}= {}}, index) =>{
                                return(
                                    <>
                                        <div className={`max-w-[50%] rounded-b-xl mb-6  shadow-lg p-4 ${ id=== user?.id ? 'bg-teal-400 rounded-tl-xl ml-auto text-white shadow-teal-900':'bg-secondary rounded-tr-xl shadow-gray-900'} `}>
                                            {message}
                                        </div>
                                        <div ref={messageRef}></div>
                                    </>
                                )  
                            }) : <div className="text-center text-lg font-semibold mt-28">No Messages</div>
                        }
                    </div>
                </div>
                {/* Input section for typing messages */}
                {
                    messages?.receiver?.fullName  &&
                
                    <div className="p-10 w-full flex items-center">
                        <Input 
                            placeholder="Type a message..." 
                            value={message} 
                            onChange={(e)=> setMessage(e.target.value)} 
                            className="w-[90%]" 
                            inputClassName="p-4 border-0 shadow-lg shadow-teal-900 rounded-full bg-secondary outline-none" />
                        <div className={`ml-4 p-3 cursor-pointer bg-gray-200 rounded-full mt-2 ${!message && 'pointer-events-none'}`} onClick={()=> sendMessage()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
                                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
                            </svg>
                        </div>
                    </div>
                }
            </div>
            {/* Right Sidebar */}
            <div className="lg:w-1/4 w-full h-full bg-teal-100 px-8 py-8 overflow-y-scroll shadow-inner shadow-teal-900">
                {/*  */}
                <div className="text-xl font-semibold text-gray-700 items-center flex justify-center py-3">People</div>
                <hr />
                <div>
                    {
                        users.length > 0 ?
                        users.map(({ userId, user }) => {
                            return(
                                <div className="flex items-center py-2 border-b border-b-gray-400">
                                    <div className="cursor-pointer flex items-center" onClick={()=>fetchMessages('new', user)}>
                                        <div>
                                            <img src={Snapchat} alt="" width={60} height={60} className="rounded-full" />
                                        </div>
                                        <div className="ml-6 text-gray-700 py-2">
                                            <h3 className="text-lg font-semibold">{user?.fullName}</h3>
                                            <p className="text-sm font-thin">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        }) :  <div className="text-center text-lg font-semibold my-28 underline">No Conversation</div>
                    }
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
