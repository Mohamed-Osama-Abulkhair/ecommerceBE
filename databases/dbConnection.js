import mongoose from "mongoose";

export const dbConnection = () => {
  mongoose
    .connect(process.env.onlineDB)
    .then(() => console.log("database Connected"))
    .catch((error) => console.log("database Error", error));
};
