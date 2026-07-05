import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux' // 🟢 useSelector add kiya
import { setCity } from '../src/features/user/user.Slice.js'
import axios from 'axios'

function useGetLocation() {
  const dispatch = useDispatch()
  const apikey = import.meta.env.VITE_GEOAPIKEY
  // 🟢 User state get ki taake check laga sakein
  const { user } = useSelector((state) => state.user)

  useEffect(() => {
    // 🟢 AGAR USER LOGIN NAHI HAI, TOH API CALL MAT KARO
    if (!user) return; 

    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          
          const result = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apikey}`,
            { withCredentials: false }
          );
          
          const cityName = result.data?.results?.[0]?.city || result.data?.results?.[0]?.village;
          
          if (cityName) {
            dispatch(setCity(cityName));
          }
        } catch (error) {
          console.error("Geoapify API Error:", error);
        }
      },
      (error) => {
        console.warn("User denied Geolocation permission:", error.message);
      }
    );
  }, [dispatch, apikey, user]); // 🟢 dependency array mein user dalna zaroori hai
}

export default useGetLocation;