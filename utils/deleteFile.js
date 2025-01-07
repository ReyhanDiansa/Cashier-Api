const fs = require("fs");
const path = require("path");

const deleteFile = (filename) => {
  try {
    const patchFoto = path.join(__dirname, `../product-foto`, filename);
    console.log(patchFoto);

    if (fs.existsSync(patchFoto)) {
      fs.unlinkSync(patchFoto); // Synchronous deletion
      console.log("File deleted successfully");
      return true;
    }
    console.warn("File does not exist:", patchFoto);
    return true;
  } catch (error) {
    console.error("Error in deleteFile function:", error);
    return false;
  }
};

module.exports = { deleteFile };
