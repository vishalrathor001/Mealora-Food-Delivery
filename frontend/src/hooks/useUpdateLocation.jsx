import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { socket } from '../socket'

function useUpdateLocation() {
  const { userData } = useSelector(state => state.user)

  useEffect(() => {
    if (!userData?._id) return;

    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude;

          // ✅ SEND VIA SOCKET (REAL-TIME)
          socket.emit('updateLocation', {
            latitude,
            longitude,
            userId: userData._id
          });

        },
        (err) => {
          console.log("Geolocation error:", err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000
        }
      );
    }

    // ✅ CLEANUP (VERY IMPORTANT)
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };

  }, [userData]);
}

export default useUpdateLocation;