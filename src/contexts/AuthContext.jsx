import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserByEmail, createUser } from "../api/users";
import { validateRegister } from "../helpers/validateRegister";
import { validateLogin } from "../helpers/validateLogin";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [loginErrors, setLoginErrors] = useState([]);
  const [registerErrors, setRegisterErrors] = useState([]);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const loginUser = (userInfo) => {
    setLoading(true);
    getUserByEmail(userInfo.email)
      .then((userData) => {
        const validationErrors = validateLogin(userData, { ...userInfo });
        if (Object.keys(validationErrors).length === 0) {
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          setLoading(false);
        } else {
          setLoading(false);
          setLoginErrors(validationErrors);
        }
      })
      .catch((error) => {
        setLoading(false);
        setLoginErrors(error.response.data);
        console.error("Failed to loginUser: ", error);
      });
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    setUser([]);
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const registerUser = (userInfo) => {
    setLoading(true);
    resetRegisterErrors();
    getUserByEmail(userInfo.email).then((userData) => {
      const validationErrors = validateRegister(userData, { ...userInfo });
      if (Object.keys(validationErrors).length === 0) {
        createUser(userInfo)
          .then((userData) => {
            setUser([userData]);
            localStorage.setItem("user", JSON.stringify(userData));
            setLoading(false);
            navigate("/");
          })
          .catch((error) => {
            setLoading(false);
            setRegisterErrors(error.response.data);
            console.error("Failed to registerUser: ", error);
          });
      } else {
        setLoading(false);
        setRegisterErrors(validationErrors);
      }
    });
  };

  const checkUserStatus = () => {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        setUser(user);
      }
    } catch (error) {
      console.error("User not authenticated: ", error);
    }
    setLoading(false);
  };

  const resetLoginErrors = () => {
    setLoginErrors([]);
  };

  const resetRegisterErrors = () => {
    setRegisterErrors([]);
  };

  const contextData = {
    user,
    loading,
    loginErrors,
    registerErrors,
    resetLoginErrors,
    resetRegisterErrors,
    loginUser,
    logoutUser,
    handleLogin,
    registerUser,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
