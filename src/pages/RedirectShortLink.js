import React, { useEffect } from 'react';
import { useHistory, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, GetFullPath } from "../Helper/TextHelper";


const RedirectShortLink = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    
      const fetchData = async () => {
        const shortLink = location.pathname.substring(1); 
        const headers = {
          "Content-Type": "application/json",
          "accept": "*/*"
        }
        var requestData = {
          "x_strKeyCode":shortLink
        }
        try {
          const response = await axios.get(API_URL + 'api/ShortLink/GetShortLink', {params: requestData, headers: headers});
          if(response.data.isSuccess){
            const newUrl = response.data.dataValue.url; // Get the new URL from the API response
            window.location.replace(newUrl); // Replace the current URL with the new URL
          }
          
        } catch (error) {
          console.error('Error fetching original URL:', error);
          // Handle error if necessary
        }
      };
      fetchData();
  }, [ location]);

  return (
    <div>
      Đang chuyển hướng...
    </div>
  );
};

export default RedirectShortLink;
