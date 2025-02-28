import { useEffect, useState } from "react";
import { addUser, getUsers } from "./firestore";

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  return (
    <div>
      <button
        onClick={() => addUser({ name: "John Doe", email: "john@example.com" })}
      >
        Add User
      </button>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
