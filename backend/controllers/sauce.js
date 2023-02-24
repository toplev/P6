const Sauce = require("../models/sauce");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  console.log(req.body);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    userLiked: [""],
    userDisLiked: [""],
  });

  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "New Sauce !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.like = (req, res, next) => {
  let like = req.body.like;
  let userId = req.body.userId;
  let databaseId = req.params.id;
  console.log(req.body);

  switch (like) {
    case 1:
      console.log("One");
      Sauce.updateOne(
        { _id: databaseId },
        { $push: { usersLiked: userId }, $inc: { likes: +1 } }
      )
        .then(() => res.status(200).json({ message: "utl aime" }))
        .catch((error) => res.status(401).json({ error }));
      break;

    case 0:
      console.log("Zero");
      Sauce.findOne({ _id: databaseId }).then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne(
            { _id: databaseId },
            { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
          )
            .then(() => res.status(200).json({ message: "utl n'aime plus" }))
            .catch((error) => res.status(401).json({ error }));
        }
        if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne(
            { _id: databaseId },
            { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
          )
            .then(() => res.status(200).json({ message: "utl n'aime plus" }))
            .catch((error) => res.status(401).json({ error }));
        }
      });
      break;

    case -1:
      console.log("Minus One");
      Sauce.updateOne(
        { _id: databaseId },
        { $push: { usersDisliked: userId }, $inc: { dislikes: +1 } }
      )
        .then(() => res.status(200).json({ message: "utl n'aime pas" }))
        .catch((error) => res.status(401).json({ error }));
      break;

    default:
      console.log(req.body);
  }
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete sauceObject._userId;

  Sauce.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { ...sauceObject, _id: req.params.id } },
    { new: true }
  )
    .then((updatedSauce) => {
      if (!updatedSauce) {
        return res.status(401).json({ message: "Not authorized" });
      }
      if (updatedSauce.userId != req.auth.userId) {
        return res.status(401).json({ message: "Not authorized" });
      }
      res.status(200).json({ message: "Sauce modified" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOneAndDelete({ _id: req.params.id, userId: req.auth.userId })
    .then((deletedSauce) => {
      if (!deletedSauce) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = deletedSauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, (error) => {
          if (error) {
            res.status(500).json({ error });
          } else {
            res.status(200).json({ message: "Sauce deleted !" });
          }
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};
