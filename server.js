const express = require('express');
const mysql = require('mysql2');

const app = express();
const poet = 3000;

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "/",
    database: ""
})