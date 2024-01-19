import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCookies } from 'react-cookie'; // Import useCookies

const supabase = createClient(
  "supabaseUrl",
  "supabaseKey"
);
function Succcess() {
  const [user, setUser] = useState({});

  const navigate = useNavigate();

  const [cookies, setCookie] = useCookies(["user_data"]);

  useEffect(() => { 
    async function getUserData() {
      await supabase.auth.getUser().then((value) => {
        if(value.data?.user) {
          setUser(value.data.user);
          console.log(value.data.user);
        }
      })
    }
    getUserData();
  }, []);

  const onSuccess = (response) => {

    // Store user data in a cookie
    const userData = {
      fullName: user.full_name,
      familyName: user.family_name,
      imageUrl: user.avatar_url,
      email: user.email,
    };

    console.log('here is the object: ' + userData);


    // Set the cookie with the user data
    setCookie('user_data', JSON.stringify(userData), { expires: new Date(Date.now() + 86400000) }); // Set cookie to expire in 1 day


    // Redirect to the "/chat" page
    navigate('/chat');

    console.log("cookie set!");
  };
  
  return (
      <div className="App"> 
        <header className="App-header">
          { Object.keys(user).length !== 0 ?
          <>
            <h1>Hi {user.email}</h1>
            <h2>This is the summary page!</h2>
            <button onClick={onSuccess}>Go to Chat</button>
          </>
          :
          <>
            <h1> User is not logged in </h1>
            <button onClick={() => { navigate("/")}}>Go Back Home</button>
          </>
          }
          <h1>Success</h1>
        </header>
      </div>
    );
  }
  
  export default Succcess;
  