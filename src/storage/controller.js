export const storageController = {
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */

  async uploadUrl(req, res) {
    res.send({ status: "Upload URL API route is working!" });
  },
};
