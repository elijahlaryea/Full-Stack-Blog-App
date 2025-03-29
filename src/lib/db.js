import mongoose from "mongoose";

const connectToDatabase = async () => {
  const connectionURL =
    "mongodb+srv://elijahlaryea567:ARC-CLUSTER@arccluster.2gue0.mongodb.net/";

  await mongoose
    .connect(connectionURL)
    .then(() => console.log("Connected to MONGODB successfully"))
    .catch((error) => console.log(error));
};

export default connectToDatabase;
