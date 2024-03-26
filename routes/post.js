const mongoose = require('mongoose');
const slugify = require('slugify');


const postSchema = mongoose.Schema({
    title: String,
    slug: String, // Add slug field
    category: String,
    content: String,
    image: String,
    date: {
        type: Date,
        default: Date.now()
    },

    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
});

// Generate slug from title before saving
postSchema.pre('save', function(next) {
    this.slug = slugify(this.title, { lower: true });
    next();
});


module.exports = mongoose.model('post', postSchema)