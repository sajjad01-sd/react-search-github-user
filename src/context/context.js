import React, { useState, useEffect } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";

const rootUrl = "https://api.github.com";

const GithubContext = React.createContext();

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);
  //request loading
  const [requests, setRequests] = useState(0);
  const [isloading, setIsLoading] = useState(false);
  //Error
  const [error, setError] = useState({ show: false, msg: "" });

  const searchGithubUser = async (user) => {
    //for default our error
    toggleError();
    setIsLoading(true);
    const response = await fetch(`${rootUrl}/users/${user}`);
    const data = await response.json();

    if (response.ok) {
      setGithubUser(data);
      const { login, followers_url } = data;

      // Repos
      const reposUrl = `${rootUrl}/users/${login}/repos?per_page=100`;

      // Followers
      const followersUrl = `${followers_url}?per_page=100`;

      //Doing two request in one time and Sent the data
      const getReposandFollowers = await Promise.all([
        fetch(reposUrl),
        fetch(followersUrl),
      ]);
      const [repos, followers] = getReposandFollowers;

      const reposData = await repos.json();
      setRepos(reposData);

      const followersData = await followers.json();
      setFollowers(followersData);
    } else {
      toggleError(true, "there is no user with that username");
    }
    checkRequests();
    setIsLoading(false);
  };
  //check rate
  const checkRequests = async () => {
    const response = await fetch(`${rootUrl}/rate_limit`);
    const data = await response.json();
    let {
      rate: { remaining },
    } = data;
    setRequests(remaining);
    if (remaining === 0) {
      //throw an error
      toggleError(true, "sorry,you have exceded your");
    }
  };
  const toggleError = function (show = false, msg = "") {
    setError({ show, msg });
  };
  useEffect(() => {
    console.log("app loaded");
    checkRequests();
  });
  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        requests,
        error,
        searchGithubUser,
        isloading,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export { GithubProvider, GithubContext };
