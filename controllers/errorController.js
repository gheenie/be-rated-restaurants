exports.handle500Error = (err, req, res, nxt) => {
  console.log(err);
  res.status(500).send({ msg: "Soz we made a mistake" });
};
