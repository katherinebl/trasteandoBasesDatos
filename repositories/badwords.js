const BadWord = require('../models/badwords.js');

exports.findAllwords = async function () {
    const badwords = await BadWord.find();
    return badwords;
};

exports.findOneWord = async function (id) {
    const badword = await BadWord.findById(id);
    return badword;
};

exports.postOneWord = async function (word) {
    const badword = new BadWord(word);
    await badword.save();
    return badword;
};

exports.updateOneWord = async function (id, updatedWord) {
    const badword = await BadWord.findById(id);
    if (badword) {
        await BadWord.findByIdAndUpdate(id, updatedWord);
        return true;
    } else {
        return false;
    }
};

exports.deleteOneWord = async function (id) {
    const badword = await BadWord.findById(id);
    if (badword) {
        await BadWord.findByIdAndRemove(id);
        return true;
    } else {
        return false;
    }
};