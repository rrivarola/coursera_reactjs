const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes: [{
        dish: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish' //Refer to the model 'Dish'  => var Dishes = mongoose.model('Dish', dishSchema);
        }
    }]
}, {
    timestamps: true
});


var Favorites = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorites;
