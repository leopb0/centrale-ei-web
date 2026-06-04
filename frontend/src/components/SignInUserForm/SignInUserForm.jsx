import { useState } from 'react';
import axios from 'axios';
import './SignInUserForm.css';

const DEFAULT_FORM_VALUES = {
  email: '',
  firstname: '',
  lastname: '',
  password: '',
};

function SignInUserForm() {
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);

  const [userSignInError, setUserSignInError] = useState(null);
  const [userSignInSuccess, setUserSignInSuccess] = useState(null);

  const displaySignInSuccessMessage = () => {
    setUserSignInSuccess('User signed in successfully');
    setTimeout(() => {
      setUserSignInSuccess(null);
    }, 3000);
  };

  const saveUser = (event) => {
    // This avoid default page reload behavior on form submit
    event.preventDefault();

    setUserSignInError(null);

    axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/users/register`, formValues)
      .then((response) => {
        displaySignInSuccessMessage();
        setFormValues(DEFAULT_FORM_VALUES);
      })
      .catch((error) => {
        setUserSignInError('An error occured while signing in.');
        console.error(error);
      });
  };

  return (
    <div>
      <form className="sign-in-form" onSubmit={saveUser}>
        <input
          className="sign-in-input"
          required
          type="email"
          placeholder="Email"
          value={formValues.email}
          onChange={(event) =>
            setFormValues({ ...formValues, email: event.target.value })
          }
        />
        <input
          className="sign-in-input"
          placeholder="First name"
          value={formValues.firstname}
          onChange={(event) =>
            setFormValues({ ...formValues, firstname: event.target.value })
          }
        />
        <input
          className="sign-in-input"
          placeholder="Last name"
          value={formValues.lastname}
          onChange={(event) =>
            setFormValues({ ...formValues, lastname: event.target.value })
          }
        />
        <input
          className="sign-in-input"
          placeholder="Password"
          type="password"
          value={formValues.password}
          onChange={(event) =>
            setFormValues({ ...formValues, password: event.target.value })
          }
        />
        <button className="sign-in-button" type="submit">
          Sign in
        </button>
      </form>
      {userSignInSuccess !== null && (
        <div className="user-signin-success">{userSignInSuccess}</div>
      )}
      {userSignInError !== null && (
        <div className="user-signin-error">{userSignInError}</div>
      )}
    </div>
  );
}

export default SignInUserForm;
