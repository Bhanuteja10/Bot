import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  "supabaseUrl",
  "supabaseKey"
);


export default function LoginPage() {
  
  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://Routing_page:3000/success'
      }
    })
    if(error)
    {
      console.error(error)
      return
    }

  }

//   supabase.auth.onAuthStateChange( (event) => {
//     if( event === "SIGNED_IN" ){
//         console.log("SIGNED_IN");
//         navigate("/success");
//     }
// });

    return (
      <div className="login-container">
        <div className="left-section"></div>
        <div className="spacer"></div>
        <div className="right-section">
          <h1>Welcome to PTB!</h1>
          <p>PTB stands for Personal Tutoring Bot, which helps students make learning more effective, individualized, and fun. PTB is based on a language model that uses deep learning to produce human-like conversations with learners. The more time you spent with PTB, the better it understands your learning style, thus it helps you better to succeed on your personal learning journey.</p>
          {/* <h5>Please login with your Google account or NAU student account after pressing the following button.</h5> */}
            <button class='login-button' type='button' onClick={loginWithGoogle}>Click Here to Start with your PTB</button>
        </div>
      </div>
    );

}
