import './Users.css';
import AddUserForm from '../../components/AddUserForm/AddUserForm';
import UsersTable from '../../components/UsersTable/UsersTable';
import { useFetchUsers } from './useFetchUsers';
import SignInUserForm from '../../components/SignInUserForm/SignInUserForm';
import LoginUserForm from '../../components/LoginUserForm/LoginUserForm';

function Users() {
  const { users, usersLoadingError, fetchUsers } = useFetchUsers();

  return (
    <div className="Users-container">
      <h1>This page displays the users</h1>
      <AddUserForm onSuccessfulUserCreation={fetchUsers} />
      <UsersTable users={users} onSuccessfulUserDeletion={fetchUsers} />
      {usersLoadingError !== null && (
        <div className="users-loading-error">{usersLoadingError}</div>
      )}
      <SignInUserForm />
      <LoginUserForm />
    </div>
  );
}

export default Users;
