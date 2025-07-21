const Home = async (req, res) => {
    res.render('index', { title: "Grabh Sanskar" });
};
module.exports = { Home };