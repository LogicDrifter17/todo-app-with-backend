
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    let [watchUserDetails, setwatchUserDetails] = useState("");
    let [watchPassword, setwatchPassword] = useState("");

    let Navigate = useNavigate();

    return (
        <div id="Login_Container">
            <div id="Login_Box">
                <div id ="Login_heading">
                    <h1>Login</h1>
                </div>
                
                    <label htmlFor="UserName">UserName/Email : </label>
                    <input
                        id="UserName"
                        value={watchUserDetails}
                        onChange={(e) => {
                            setwatchUserDetails(e.target.value);
                        }}
                        placeholder="Enter UserName/Email..."
                    />
               

              
                    <label htmlFor="Password">Password : </label>

                    <input
                        id="Password"
                        type="password"
                        value={watchPassword}
                        onChange={(e) => {
                            setwatchPassword(e.target.value);
                        }}
                        placeholder="Enter Password"
                    />
                
                <div id ="Login_buttons"> 
                <button
                    onClick={async () => {
                        try {
                            const result = await fetch("http://localhost:3000/login", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                credentials: "include",
                                body: JSON.stringify({
                                    userDetails: watchUserDetails,
                                    password: watchPassword
                                })
                            });

                            const response = await result.json();

                            if (result.ok) {
                                console.log(response.message);
                                Navigate("/home");
                            } else {
                                console.log(response.message);
                            }

                        } catch (error) {
                            console.log("Request failed:", error.message);
                        }
                    }}
                >
                    Login
                </button>

                <button
                    onClick={() => {
                        Navigate("/NewAccount");
                    }}
                >
                    Create New Account
                </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
