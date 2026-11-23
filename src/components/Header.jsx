
import { useNavigate } from 'react-router-dom';

const Header = () => {

  let Navigate = useNavigate();

  return (
    <div id="Header">

      <button
        id="logout"
        onClick={async () => {

          try {
            const result = await fetch("http://localhost:3000/Logout", {
              method: "DELETE",
              credentials: "include"
            });

            const response = await result.json();

            if (result.ok) {
              console.log(response.message);
              Navigate("/");
            } else {
              console.log(response.message);
            }

          } catch (error) {
            console.log("Request failed:", error.message);
          }

        }}
      >
        logout
      </button>

    </div>
  );
};

export default Header;
