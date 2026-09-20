import { useState } from "react";
import PageBackButton from "../../../../shared/components/PageBackButton/PageBackButton.jsx";

import UsersSearch from "../../components/UsersSearch/UsersSearch.jsx";
import UsersResults from "../../components/UsersResults/UsersResults.jsx";

import useUserSearch from "../../hooks/useUserSearch.js";

import "./UserSearchPage.css";

const UserSearchPage = () => {
  const [query, setQuery] = useState("");

  const { users, isLoading, error, updateUserFollowing } = useUserSearch(query);

  return (
    <main className="users-page">
      <div className="users-page__header">
        <PageBackButton label="Знайти читачів" />

        <div>
          <h1>Знайти читачів</h1>

          <p>Знайдіть друзів серед користувачів бібліотеки</p>
        </div>
      </div>

      <UsersSearch query={query} onQueryChange={setQuery} />

      <div className="users-page__results">
        <UsersResults
          query={query}
          users={users}
          isLoading={isLoading}
          error={error}
          onFollowingChange={updateUserFollowing}
        />
      </div>
    </main>
  );
};

export default UserSearchPage;

