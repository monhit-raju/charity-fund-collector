@echo off
echo Testing Admin Endpoints...
echo.

echo 1. Testing Admin Login:
curl -X POST http://localhost:5000/api/v1/admin/login -H "Content-Type: application/json" -d "{\"email\":\"raju@gmail.com\",\"password\":\"12345678\"}"
echo.
echo.

echo 2. Testing Admin Stats (with Basic Auth):
curl -X GET http://localhost:5000/api/v1/admin/stats -H "Authorization: Basic cmFqdUBnbWFpbC5jb206MTIzNDU2Nzg="
echo.
echo.

echo 3. Testing Get Users:
curl -X GET http://localhost:5000/api/v1/admin/users -H "Authorization: Basic cmFqdUBnbWFpbC5jb206MTIzNDU2Nzg="
echo.
echo.

echo 4. Testing Get Donations:
curl -X GET http://localhost:5000/api/v1/admin/donations -H "Authorization: Basic cmFqdUBnbWFpbC5jb206MTIzNDU2Nzg="
echo.
echo.

echo All tests completed!