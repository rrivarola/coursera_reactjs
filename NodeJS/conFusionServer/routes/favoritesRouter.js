const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');
const favoritesRouter = express.Router();
favoritesRouter.use(bodyParser.json());


favoritesRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Favorites.find({})
            .populate('comments.author')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favorites.findOne({ user: req.user._id }, (err, favorite) => {
            if (err) {
                next(err);
            }
            if (favorite)// add the dishes specified in the body of the message to the list of favorite dishes for
            //the user if the dishes do not already exists in the list of favorites.
            {
                req.body.map(f => {
                    if (favorite.dishes.find(dish => dish._id == f._id) == null) {
                        favorite.dishes.push(f);
                    }
                });
                favorite.save()
                    .then((f) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(f);
                    }, (err) => next(err));
            }
            else {//create a favorite document 
                Favorites.create({ user: req.user._id, dishes: req.body })
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    }, (err) => next(err))
                    .catch((err) => next(err));
            }
        });
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favorites.remove({ user: req.user._id })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


    favoritesRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
        .then((favorite)=>{
            if (favorite) {
                const found= favorite.dishes.find(dish => dish._id == req.params.dishId);
                if (found == null) {
                    favorite.dishes.push(req.params.dishId);
                    favorite.save()
                        .then((f) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(f);
                        }, (err) => next(err));
                }
                else{
                    err = new Error('Dish ' + req.params.dishId + ' already exist as favorite');
                    err.status = 403;
                    return next(err);
                }
            }
            else{
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favorites.findOne({user: req.user._id})
        .then((favorite)=>{
            if (favorite) {
                const found= favorite.dishes.find(dish => dish._id == req.params.dishId);
                if (found != null) {
                    for (var i = 0; i<(favorite.dishes.length - 1);  i++) {
                        if(favorite.dishes[i]._id==req.params.dishId)
                        {
                            break;
                        }
                    }

                   favorite.dishes.id(favorite.dishes[i]._id).remove()
                   favorite.save()
                        .then((dish) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dish);
                        }, (err) => next(err));
                }
                else{
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.statusCode = 404;
                    return next(err);
                }
            }
            else{
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
            .catch((err) => next(err));
    });



module.exports = favoritesRouter;