import { useState } from 'react';
import axios from 'axios';
import './LoginUserForm.css';

const DEFAULT_FORM_VALUES = {
  email: '',
  password: '',
};

function LoginUserForm() {
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);

  const [userLoginError, setUserLoginError] = useState(null);
  const [userLoginSuccess, setUserLoginSuccess] = useState(null);

  const displayLoginSuccessMessage = () => {
    setUserLoginSuccess('User logged in successfully');
    setTimeout(() => {
      setUserLoginSuccess(null);
    }, 3000);
  };

  const loginUser = (event) => {
    event.preventDefault();

    setUserLoginError(null);

    axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/users/login`, formValues)
      .then((response) => {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        displayLoginSuccessMessage();
        setFormValues(DEFAULT_FORM_VALUES);
        console.log('Login successful, token stored in localStorage');
      })
      .catch((error) => {
        setUserLoginError('Invalid email or password.');
        console.error(error);
      });
  };

  return (
    <div>
      <form className="login-form" onSubmit={loginUser}>
        <input
          className="login-input"
          required
          type="email"
          placeholder="Email"
          value={formValues.email}
          onChange={(event) =>
            setFormValues({ ...formValues, email: event.target.value })
          }
        />
        <input
          className="login-input"
          required
          type="password"
          placeholder="Password"
          value={formValues.password}
          onChange={(event) =>
            setFormValues({ ...formValues, password: event.target.value })
          }
        />
        <button className="login-button" type="submit">
          Log in
        </button>
      </form>
      {userLoginSuccess !== null && (
        <div className="user-login-success">{userLoginSuccess}</div>
      )}
      {userLoginError !== null && (
        <div className="user-login-error">{userLoginError}</div>
      )}
    </div>
  );
}

export default LoginUserForm;
