import { createSlice, current } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    currentCity: null,
    currentState: null,
    currentAddress: null,
    shopInMyCity: null,
    itemsInMyCity: null,
    cartItems: [],
    totalAmount: 0,
    myOrders: [],
   
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload
    },
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload
    },
    setShopsInMyCity: (state, action) => {
      state.shopInMyCity = action.payload
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload
    },
    
    addToCart: (state, action) => {
      const cartItem = action.payload
      const existingItem = state.cartItems.find(i => i.id == cartItem.id)
      if (existingItem) {
        existingItem.quantity += cartItem.quantity
      } else {
        state.cartItems.push(cartItem)
      }

      state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

    },

    setTotalAmount: (state, action) => {
      state.totalAmount = action.payload
    }

    ,

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.cartItems.find(i => i.id == id)
      if (item) {
        item.quantity = quantity
      }
      state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    },

    removeCartItem: (state, action) => {
      state.cartItems = state.cartItems.filter(i => i.id !== action.payload)
      state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    },

    setMyOrders: (state, action) => {
      state.myOrders = action.payload
    },
    addMyOrder: (state, action) => {
      state.myOrders = [action.payload, ...state.myOrders]
    }

    ,
    updateOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload
      const order = state.myOrders.find(o => o._id == orderId)
      if (order) {
        if (order.shopOrders && order.shopOrders.shop._id == shopId) {
          order.shopOrders.status = status
        }
      }
    },

    updateRealtimeOrderStatus: (state, action) => {
      const { orderId, shopOrderId, status } = action.payload;

      const order = state.myOrders.find(o => o._id == orderId);

      if (!order) return;

      
      if (!Array.isArray(order.shopOrders)) {
        if (String(order.shopOrders._id) === String(shopOrderId)) {
          order.shopOrders.status = status;
        }
      }


      else {
        const shopOrder = order.shopOrders.find(
          so => String(so._id) === String(shopOrderId)
        );

        if (shopOrder) {
          shopOrder.status = status;
        }
      }
    },

    setSearchItems: (state, action) => {
      state.searchItems = action.payload
    },
    updateDeliveryBoy: (state, action) => {
      const { orderId, shopOrderId, deliveryBoy } = action.payload;

      const order = state.myOrders.find(o => o._id === orderId);

      if (order) {
        if (Array.isArray(order.shopOrders)) {
          const shopOrder = order.shopOrders.find(so => so._id === shopOrderId);
          if (shopOrder) {
            shopOrder.assignedDeliveryBoy = deliveryBoy;
          }
        } else {
          if (order.shopOrders._id === shopOrderId) {
            order.shopOrders.assignedDeliveryBoy = deliveryBoy;
          }
        }
      }
    }
  }
})

export const { setUserData, setCurrentAddress, setCurrentCity, updateDeliveryBoy, setCurrentState, setShopsInMyCity, setItemsInMyCity, addToCart, updateQuantity, removeCartItem, setMyOrders, addMyOrder, updateOrderStatus, setSearchItems, setTotalAmount, updateRealtimeOrderStatus } = userSlice.actions
export default userSlice.reducer