import './Users.css';
import UsersTable from '../../components/UsersTable/UsersTable';
import { useFetchUsers } from './useFetchUsers';
import SignInUserForm from '../../components/SignInUserForm/SignInUserForm';
import LoginUserForm from '../../components/LoginUserForm/LoginUserForm';

function Users() {
  const { users, usersLoadingError, fetchUsers } = useFetchUsers();
  const isAdmin = localStorage.getItem('userEmail') === 'dev@gmail.com';
  const isLoggedIn = !!localStorage.getItem('authToken');

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    window.location.reload();
  };

  return (
    <div className="Users-container">
      <h1>Utilisateurs</h1>

      {isAdmin && (
        <>
          <h2 className="Users-section-title">Liste des utilisateurs</h2>
          {usersLoadingError !== null && (
            <div className="users-loading-error">{usersLoadingError}</div>
          )}
          <UsersTable users={users} onSuccessfulUserDeletion={fetchUsers} />
        </>
      )}

      <h2 className="Users-section-title">Créer un compte</h2>
      <SignInUserForm onSuccessfulRegister={fetchUsers} />

      {isLoggedIn ? (
        <>
          <h2 className="Users-section-title">Compte actif</h2>
          <button className="logout-button" onClick={logout}>Se déconnecter</button>
        </>
      ) : (
        <>
          <h2 className="Users-section-title">Se connecter</h2>
          <LoginUserForm />
        </>
      )}
    </div>
  );
}

export default Users;
