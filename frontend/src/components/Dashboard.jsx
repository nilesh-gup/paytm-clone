import { useEffect, useState } from "react"
import axios from 'axios'
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
    const [balance, setBalance] = useState(0)
    const [users, setUsers] = useState([])

    useEffect(() => {
        const APICalls = async() => {
            try {
                const token = localStorage.getItem('loggedInToken')
                const response = await axios.get('http://localhost:3000/api/v1/account', {
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                })
                setBalance(response.data.balance.toFixed(2))
            } catch(e) {
                console.log("Error: " + e)
            }

            try {
                const response = await axios.get('http://localhost:3000/api/v1/user/bulk')
                setUsers(response.data.users)
            } catch(e) {
                console.log("Error: " + e)
            }
        }
        APICalls()
    }, [])

    const onFilterChange = async (event) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/v1/user/bulk?filter=${event.target.value}`)
            setUsers(response.data.users)
        } catch(e) {
            console.log("Error: " + e)
        }
    }

    return (
        <div>
            <TopNavBar />
            <p className='font-bold text-xl p-3 ml-2'>Your balance Rs. {balance}</p>
            <p className='font-bold text-xl p-3 ml-2'>Users</p>
            <input
                className='border-2 w-[98%] p-2 m-4 rounded-lg'
                placeholder='Search users...' 
                onChange={(event) => {onFilterChange(event)}} />
            {users.map(user => <UserComponent userdetails={user}/>)}
        </div>
    )

}

function TopNavBar() {
    return (
        <div className='flex justify-between items-center border-2 p-2'>
            <p className='text-2xl font-bold'>Payments App</p>
            <div className='flex items-center'>
                <p className='text-xl font-normal'>Hello, User</p>
                <p className='bg-gray-200 p-4 font-semibold rounded-full ml-4 mr-2 w-12 h-12 flex justify-center items-center'>U</p>
            </div>
        </div>
    )
}

function UserComponent({userdetails}) {
    const navigate = useNavigate()

    return (
        <div className='flex justify-between items-center border-[1px] m-2 p-4'>
            <div className='flex items-center'>
                <p className='bg-gray-200 p-4 font-semibold rounded-full ml-4 mr-2 w-12 h-12 flex justify-center items-center'>{userdetails.firstName[0]}{userdetails.lastName[0]}</p>
                <p className='font-semibold text-xl'>{userdetails.firstName} {userdetails.lastName}</p>
            </div>
            <div 
                className='bg-black text-white h-10 w-[10%] flex justify-center items-center rounded-lg cursor-pointer'
                onClick={() => {
                    navigate(`/sendmoney?userId=${userdetails._id}&firstName=${userdetails.firstName}&lastName=${userdetails.lastName}`)
                }}>
                    Send Money
                </div>
        </div>
    )
}