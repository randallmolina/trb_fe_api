 

module.exports = {

  host          : process.env.PGHOST || "localhost",

  port          : process.env.PGPORT || "5432",
  
  database       : process.env.PGDATABASE || "trb_bd",

  user          : process.env.PGUSER || "postgres", 

  password      : process.env.PGPASSWORD || "exdesa" ,

  connectionString  : process.env.connectionString || "postgres://postgres:exdesa@192.190.42.116:5432/trb_bd",

  config : {
    user: "postgres",
    password: "exdesa",
    host: "192.190.42.116",
    port: "5432",
    database: "trb_bd" }
   
};
