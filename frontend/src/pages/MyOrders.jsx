import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import { setMyOrders, updateOrderStatus, updateRealtimeOrderStatus } from '../redux/userSlice';
import { socket } from "../socket"
import { addMyOrder } from "../redux/userSlice";
import { updateDeliveryBoy } from '../redux/userSlice';

function MyOrders() {
    const { userData, myOrders } = useSelector(state => state.user)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
        if (!userData?._id) return;

        const newOrderHandler = (data) => {

            const exists = myOrders.find(o => o._id === data._id);
            if (exists) return;

            if (userData.role === "owner") {
                const ownerId = data.shopOrders?.owner?._id || data.shopOrders?.owner;

                if (String(ownerId) === String(userData._id)) {
                    dispatch(addMyOrder(data));
                }
            }

            if (userData.role === "user") {
                if (data.user?._id === userData._id) {
                    dispatch(addMyOrder(data));
                }
            }
        };

        const statusHandler = (data) => {

            const { orderId, shopOrderId, status, userId } = data;

            if (String(userId) === String(userData._id)) {
                dispatch(updateRealtimeOrderStatus({
                    orderId,
                    shopOrderId,
                    status
                }));
            }
        };

        const deliveryAssignedHandler = ({ orderId, shopOrderId, deliveryBoy }) => {
            dispatch(updateDeliveryBoy({
                orderId,
                shopOrderId,
                deliveryBoy
            }));
        };

        // 🔥 NEW HANDLER
        const deliveredHandler = ({ orderId, shopOrderId, status }) => {
            dispatch(updateRealtimeOrderStatus({
                orderId,
                shopOrderId,   // ✅ CORRECT
                status
            }));
        };

        socket.on("newOrder", newOrderHandler);
        socket.on("update-status", statusHandler);
        socket.on("delivery-boy-assigned", deliveryAssignedHandler);

        // 🔥 ADD THIS
        socket.on("order-delivered", deliveredHandler);

        return () => {
            socket.off("newOrder", newOrderHandler);
            socket.off("update-status", statusHandler);
            socket.off("delivery-boy-assigned", deliveryAssignedHandler);

            // 🔥 CLEANUP
            socket.off("order-delivered", deliveredHandler);
        };

    }, [userData, myOrders]);




    return (
        <div className='w-full min-h-screen bg-[#fff9f6] flex justify-center px-4'>
            <div className='w-full max-w-200 p-4'>

                <div className='flex items-center gap-5 mb-6 '>
                    <div className=' z-10 ' onClick={() => navigate("/")}>
                        <IoIosArrowRoundBack size={35} className='text-[#ff4d2d]' />
                    </div>
                    <h1 className='text-2xl font-bold  text-start'>My Orders</h1>
                </div>
                <div className='space-y-6'>
                    {myOrders?.map((order, index) => (
                        userData.role == "user" ?
                            (
                                <UserOrderCard data={order} key={index} />
                            )
                            :
                            userData.role == "owner" ? (
                                <OwnerOrderCard data={order} key={index} />
                            )
                                :
                                null
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MyOrders
