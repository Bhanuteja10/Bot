import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCookies } from 'react-cookie'; // Import useCookies
import './success.css';

const supabase = createClient(
  "supabaseUrl",
  "supabaseKey"
);

function Success() {
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies(["user_data"]);

  useEffect(() => { 
    async function getUserData() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        console.log('No active session')
        return
        }

      const { user } = session

      console.log('Current user:', user)
      console.log('User email:', user.email)

      setUser(user);
    }
    getUserData();
  }, []);

  useEffect(() => {
    if (Object.keys(user).length !== 0) {
      // This useEffect will execute when `user` changes, i.e., after the getUserData() call
      console.log(user);
      console.log(user.user_metadata.full_name);

      // Store user data in a cookie (moved from onSuccess)
      const userData = {
        fullName: user.user_metadata.full_name,
        imageUrl: user.user_metadata.avatar_url,
        email: user.user_metadata.email,
      };
      setCookie('user_data', JSON.stringify(userData), { expires: new Date(Date.now() + 86400000) }); // Set cookie to expire in 1 day

      // Delay the navigation for 10 seconds
      const delayMillis = 1; // 10 seconds
      setTimeout(() => {
        navigate('/first');
      }, delayMillis);
    }
  }, [user, navigate, setCookie]);

  return (
    // <div className="App"> 
    //   <header className="App-header">
    //     {Object.keys(user).length !== 0 ?
    //       <>
    //         <h1>Hi {user.email}</h1>
    //         <h2>This is the summary page!</h2>
    //         {/* Removed onClick={onSuccess} */}
    //       </>
    //       :
    //       <>
    //         <h1> User is not logged in </h1>
    //         <button onClick={() => { navigate("/")}}>Go Back Home</button>
    //       </>
    //     }
    //     <h1>Success</h1>
    //   </header>
    // </div>
    // <div className="success-container">
    //   {/* Left section with bot image */}
    //   <div className="left-section">
    //   </div>
      
    //   {/* Right section with summary message */}
    //   <div className="right-section">
    //   <h1 className="summary-title">Summary</h1>
    //     <div className="summary-dialogue">
    //       <p className="summary-message">
    //         Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    //       </p>
    //       <p className="summary-message">
    //        Nullam id justo sed odio faucibus congue non at nisi.
    //       </p>
    //       <p className="summary-message">
    //       Sed vel tortor sit amet ipsum elementum fermentum.  
    //       </p>
    //     </div>
    //   </div>
    // </div>
    <p></p>
  );
}

export default Success;