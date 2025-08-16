### file and Folder structure

# index.js ==> DB connects

# app.js ==> config, cookies, urlencoded

# constants ==> enums, DB-name

## folder Structure

# controllers ==> functionality

# models ==> Schema

# routes ==> /Api

# utils ==> reusing or file upload

# DB ==> Databse

# config

# middleware

# services

#### Importat

## Data kya kya store kar rhe hai

## ================HTTP======================

metadata => key value sent along with req & res

caching, authentication, manage state
x-prefix -> 2012 (x-deprecated)

1. Request Headers --> from client
2. Response Headers --> from server
3. Representation headers --> encoding/ compression
4. payload headers --> data

# Most common Headers

1. Accept: application/json
2. user-Agent. ==> konse browser se data aaya hai wo batayega ye
3. Authorization ==> beareer token(jwt token)
4. content-type ==> what type of data you are sending
5. cookie ==> kitne time k lye kon login hai kya hai nahi hai uske lye cookie use karte hai
6. cache-control ==> kitne tym k baad data ko remove karna hai cache hatana hai ya nahi aur haatana hai to kaise

## ===========CORS==========================

1. Access-control-allow-origin
2. Access-control-Allow-credentials
3. Access-control-Allow-Method

## ==================Security==================

cross-origin-embedder-policy
cross-orign-opener-policy
content-security-policy
x-xss-protection

## ============STATUS CODE=======================

1. 1xx ==> Informational
2. 2xx ==> Success
3. 3xx ==> Redirection
4. 4xx ==> Client error
5. 5xx ==> server error

6. 100 ==> Continue
7. 102 ==> Processing
8. 200 ==> Ok
9. 201 ==> Created
10. 202 ==> Accepted
11. 307 ==> Temporary redirect
12. 308 ==> Permanent redirect
13. 400 ==> Bad request
14. 401 ==> Unauthorized
15. 402 ==> Payment required
16. 404 ==> Not Found
17. 500 ==> Internal server error
18. 504 ==> Gateway time Out

## ==============================================================================

# Access Token:- Access tokens are short lived(based on situation)

# Refresh Token:- Refresh tokens are long lived(based on situation)

# refresh token user ko bhi dete hai aur database m bhi save rakhte hai .....Agar user k paas jo refresh token hai aur database m jo refresh token hai wo dono same hai to kaam chal jayega
