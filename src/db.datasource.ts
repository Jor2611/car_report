//////////////////////////
/// Only for migration ///
//////////////////////////
import { dataSourceOptions } from "./db.datasourceOptions";
import { DataSource } from "typeorm";

let dataSource = new DataSource(dataSourceOptions);
dataSource
  .initialize()
  .then(() => {
    console.log("Data Source has been initialized successfully.");
  })
  .catch((err) => {
    console.error("Error during Daa Source initialization:",err);
  })

export default dataSource;