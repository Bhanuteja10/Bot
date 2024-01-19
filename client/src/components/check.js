import { createClient } from "@supabase/supabase-js";
import { Auth} from "@supabase/auth-ui-react";
import { useNavigate } from "react-router-dom";
import {useState, useEffect} from 'react';
import {ThemeSupa} from '@supabase/auth-ui-shared';
import { useCookies } from 'react-cookie';

const supabase = createClient(
  "supabaseUrl",
  "supabaseKey"
);

// check.js


const CheckSession = async () => {
  // const [cookies, setCookie] = useCookies(['user_data']);
  
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    console.log('No active session')
    return
  }

  const { user } = session

  console.log('Current user:', user)
  console.log('User email:', user.email)

  // const userData = {
  //   fullName: user.user_metadata.full_name,
  //   imageUrl: user.user_metadata.picture,
  //   email: user.email,
  // };

  // Set the cookie with the user data
  // setCookie('user_data', JSON.stringify(userData), { expires: new Date(Date.now() + 8640) }); // Set cookie to expire in 1 day

  // console.log('cookie created');
}

export default CheckSession();

