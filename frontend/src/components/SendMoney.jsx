import axios from 'axios'
import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function SendMoney() {
    const [searchParams, setSearchParams] = useSearchParams()
    const userId = searchParams.get('userId')
    const firstName = searchParams.get('firstName')
    const lastName = searchParams.get('lastName')
    const [amount, setAmount] = useState(0)
    const [showStatus, setShowStatus] = useState(false)
    const [statusMessage, setStatusMessage] = useState('')
    const [success, setSuccess] = useState(false)
    const timeoutRef = useRef(0)

    const initiateTransfer = async () => {
        clearTimeout(timeoutRef.current)
        setShowStatus(false)
        try {
            await axios.post('http://localhost:3000/api/v1/account/transfer', {
                to: userId,
                amount
            }, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('loggedInToken')
                }
            })

            setStatusMessage('Transfer successful')
            setShowStatus(true)
            setSuccess(true)
            timeoutRef.current = setTimeout(() => {
                setShowStatus(false)
            }, 2000)

        } catch(e) {
            if(e.response.status === 409) {
                setStatusMessage('Insufficient balance')
            } else {
                setStatusMessage('Transfer not successful')
            }
            setShowStatus(true)
            setSuccess(false)

            timeoutRef.current = setTimeout(() => {
                setShowStatus(false)
            }, 2000)
        }

    }
    return (
        <div>
            <div className='h-screen bg-gray-400 flex'>
                <div className="bg-white h-max w-[25%] m-auto rounded-lg p-4">
                    <center><p className='text-3xl font-bold pb-2'>Send Money</p></center>

                    <div className='flex items-center mt-4 mb-4'>
                        <p className='bg-gray-200 p-4 font-semibold rounded-full ml-4 mr-2 w-12 h-12 flex justify-center items-center'>{firstName[0]}{lastName[0]}</p>
                        <p className='font-semibold text-xl'>{firstName} {lastName}</p>
                    </div>

                    <div className='pt-6 pb-1 pl-1 pr-1'>
                        <p className='font-semibold pb-2'>Amount (in Rs.)</p>
                        <input 
                            className='border-gray border-2 rounded w-full h-10 p-2 placeholder:text-gray-500' 
                            placeholder={'Enter amount'}
                            type='number'
                            onChange={(e) => {setAmount(parseFloat(e.target.value))}} />
                    </div>
                    {showStatus && <p className={`text-${success ? 'green-700' : 'red-500'} font-bold`}>{statusMessage}</p>}
                    <div 
                        className='bg-green-600 text-white h-[40px] flex justify-center items-center rounded-lg mt-2 ml-1 mr-1 cursor-pointer'
                        onClick={initiateTransfer}>
                        Initiate Transfer
                    </div>

                </div>
            </div>
        </div>
    )
}