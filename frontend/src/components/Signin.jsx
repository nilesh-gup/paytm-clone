import { Link, useNavigate } from 'react-router-dom'
import '../index.css'
import { useState } from 'react'
import axios from 'axios'

export default function Signin() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showWarning, setShowWarning] = useState(false)

    const navigate = useNavigate()
    
    const onSignInClick = async () => {
        try {
            const response = await axios.post('http://localhost:3000/api/v1/user/signin', {
                username,
                password
            })
            localStorage.setItem('loggedInToken', response.data.token)
            navigate('/dashboard')
        } catch(e) {
            console.log('Some error occurred')
            if(e.response.status === 409) {
                setShowWarning(true)
                return
            }
            navigate('/error')
        }
    }

    return (
        <div className='h-screen bg-gray-400 flex'>
            <div className="bg-white h-max w-[25%] m-auto rounded-lg p-4">
                <div className='flex flex-col items-center'>
                    <p className='text-3xl font-bold pb-2'>Sign In</p>
                    <p className='text-md text-gray-600 w-[80%] text-center'>Enter your credentials to access your account</p>
                </div>

                <TitleAndInput onChange={(e) => {setUsername(e.target.value)}} title={'Username'} placeholder={'john-doe'}/>
                <TitleAndInput title={'Password'}
                    onChange={(e) => {
                        setPassword(e.target.value)
                    }}
                    showWarning={showWarning} 
                    warningText='Username or password incorrect' />

                <div 
                    className='bg-black text-white h-[40px] flex justify-center items-center rounded-lg mt-2 ml-1 mr-1 cursor-pointer'
                    onClick={onSignInClick}>
                        Sign In
                </div>

                <div className='flex justify-center p-2'>
                    <p className='font-normal'>Don't have an account? <Link to='/signup' className='underline'> Sign Up </Link></p>
                </div>
            </div>
        </div>
    )
}

function TitleAndInput({title, placeholder, onChange, showWarning=false, warningText=''}) {
    return (
        <div className='pt-6 pb-1 pl-1 pr-1'>
            <p className='font-semibold pb-2'>{title}</p>
            <input 
                className='border-gray border-2 rounded w-full h-10 p-2 placeholder:text-gray-500' 
                placeholder={placeholder} 
                onChange={onChange} />
            {showWarning && <p className='text-sm p-1 text-red-500'>{warningText}</p>}
        </div>
    )
}