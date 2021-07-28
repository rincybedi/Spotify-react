import React, { useState, useEffect } from 'react';
import axios from 'axios';
export default function useAuth(code) {
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [expiresIn, setExpiresIn] = useState();

  useEffect(() => {
    axios
      .post('http://localhost:5000/login', { code })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        setExpiresIn(res.data.expiresIn);
        window.history.pushState({}, null, '/');
      })
      .catch((error) => {
        // console.log(error);
        window.location = '/';
      });
  }, [code]);

  useEffect(() => {
    if (!refreshToken || !expiresIn) return;
    const interval = setInterval(() => {
      axios
        .post('http://localhost:5000/refresh', { refreshToken })
        .then((res) => {
          console.log('hi');
          setAccessToken(res.data.accessToken);
          setExpiresIn(res.data.expiresIn);
        })
        .catch((error) => {
          console.log(error);
          // window.location = '/';
        });
    }, (expiresIn - 60) * 1000);
    return () => clearInterval(interval);
  }, [expiresIn, refreshToken]);
  return accessToken;
}
