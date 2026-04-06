import User from "./models/user.model.js"

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    socket.on('identity', async ({ userId }) => {
      try {
        await User.findByIdAndUpdate(userId, {
          socketId: socket.id,
          isOnline: true
        });
      } catch (error) {
        console.log("identity error:", error);
      }
    });

    socket.on('updateLocation', async ({ latitude, longitude, userId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          isOnline: true,
          socketId: socket.id
        });

        if (user) {
          io.emit('updateDeliveryLocation', {
            deliveryBoyId: userId,
            latitude,
            longitude
          });
        }

      } catch (error) {
        console.log('updateLocation error:', error);
      }
    });

    socket.on('disconnect', async () => {
      try {
        await User.findOneAndUpdate(
          { socketId: socket.id },
          { socketId: null, isOnline: false }
        );
      } catch (error) {
        console.log("disconnect error:", error);
      }
    });

  });
};