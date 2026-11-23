
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NewAccount = () => {
  let [WatchUserName, setWatchUserName] = useState("");
  let [WatchEmail, setWatchEmail] = useState("");
  let [WatchPassword, setWatchPassword] = useState("");

  let Navigate = useNavigate();

  return (
    <div id="New_Account">
    <div id="NewAccount_Container">
      <div id="NewAccount_Heading"><h1>Create New Account </h1></div>
      <div id="NewAccount_Details">
      <div> 
        <label htmlFor="UserName">UserName : </label>
        <input
          id="UserName"
          value={WatchUserName}
          onChange={(e) => {
            setWatchUserName(e.target.value);
          }}
        />
      
        </div>

      <div> 
        <label htmlFor="Email">Email : </label>
        <input
          id="Email"
          type="email"
          value={WatchEmail}
          onChange={(e) => {
            setWatchEmail(e.target.value);
          }}
        />
       
      </div>

      <div>
        <label htmlFor="Password">Password : </label>
        <input
          id="Password"
          type="password"
          value={WatchPassword}
          onChange={(e) => {
            setWatchPassword(e.target.value);
          }}
        />
       
      </div>
        </div>
      <div id="Create_Account_Button">
      <button
        onClick={async () => {
          try {
            const result = await fetch("http://localhost:3000/NewAccount", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              credentials: "include",
              body: JSON.stringify({
                UserName: WatchUserName,
                Email: WatchEmail,
                Password: WatchPassword
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
        Create Account
      </button>
        </div>
    </div>
    </div>
  );
};

export default NewAccount;
